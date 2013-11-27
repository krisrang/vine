require 'timeout'

require_dependency 'url_helper'

class PullHotlinkedImages
  include Sidekiq::Worker
  include UrlHelper

  def initialize
    # maximum size of the file in bytes
    @max_size = SiteSetting.max_image_size_kb.kilobytes
  end

  def perform(args = {})
    args = args.with_indifferent_access
    
    return unless SiteSetting.download_remote_images_to_local?

    message_id = args[:message_id]
    raise Vine::InvalidParameters.new(:message_id) unless message_id.present?

    message = Message.where(id: message_id).first
    return unless message.present?

    source = message.source.dup
    downloaded_urls = {}

    extract_images_from(message.cooked).each do |image|
      src = image['src']

      if is_valid_image_url(src)
        begin
          # have we already downloaded that file?
          if !downloaded_urls.include?(src)
            hotlinked = download(src)
            puts "Downloading #{src} from #{message_id}"
            if hotlinked.try(:size) <= @max_size
              filename = File.basename(URI.parse(src).path)
              file = ActionDispatch::Http::UploadedFile.new(tempfile: hotlinked, filename: filename)
              upload = Upload.create_for(message.user, file)
              downloaded_urls[src] = upload.file.url
            else
              puts "Failed to pull hotlinked image: #{src} - Image is bigger than #{@max_size}"
            end
          end
          # have we successfuly downloaded that file?
          if downloaded_urls[src].present?
            url = downloaded_urls[src]
            escaped_src = src.gsub("?", "\\?").gsub(".", "\\.").gsub("+", "\\+")
            # there are 6 ways to insert an image in a post
            # HTML tag - <img src="http://...">
            source.gsub!(/src=["']#{escaped_src}["']/i, "src='#{url}'")
            # BBCode tag - [img]http://...[/img]
            source.gsub!(/\[img\]#{escaped_src}\[\/img\]/i, "[img]#{url}[/img]")
            # Markdown linked image - [![alt](http://...)](http://...)
            source.gsub!(/\[!\[([^\]]*)\]\(#{escaped_src}\)\]/) { "[<img src='#{url}' alt='#{$1}'>]" }
            # Markdown inline - ![alt](http://...)
            source.gsub!(/!\[([^\]]*)\]\(#{escaped_src}\)/) { "![#{$1}](#{url})" }
            # Markdown reference - [x]: http://
            source.gsub!(/\[(\d+)\]: #{escaped_src}/) { "[#{$1}]: #{url}" }
            # Direct link
            source.gsub!(src, "<img src='#{url}'>")
          end
        ensure
          # close & delete the temp file
          hotlinked && hotlinked.close!
        end
      end
    end

    # TODO: make sure the post hasn´t changed while we were downloading remote images
    if source != message.source
      message.system_update({source: source})
    end
  end


  def extract_images_from(html)
    doc = Nokogiri::HTML::fragment(html)
    doc.css("img") - doc.css(".onebox-result img") - doc.css("img.avatar")
  end

  def is_valid_image_url(src)
    src.present? && !is_upload(src) && !is_local(src)
  end

  def download(url)
    return if @max_size <= 0
    extension = File.extname(URI.parse(url).path)
    tmp = Tempfile.new(["vine-hotlinked", extension])

    begin
      status = Timeout::timeout(30, Errno::ETIMEDOUT) do
        File.open(tmp.path, "wb") do |f|
          hotlinked = open(url, "rb", read_timeout: 5)
          while f.size <= @max_size && data = hotlinked.read(@max_size)
            f.write(data)
          end
          hotlinked.close!
        end
      end
    rescue Errno::ETIMEDOUT
      tmp.close
      tmp.unlink
    end

    tmp
  end
end
