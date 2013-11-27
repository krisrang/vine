require_dependency 'oneboxer'

class MessageAnalyzer
  def initialize(source)
    @source = source
  end

  # What we use to cook posts
  def cook(*args)
    cooked = PrettyText.cook(*args)

    result = Oneboxer.apply(cooked) do |url, elem|
      Oneboxer.invalidate(url) if args.last[:invalidate_oneboxes]
      begin
        Oneboxer.onebox url
      rescue => e
        Rails.logger.warn("Failed to cook onebox: #{e.message} #{e.backtrace}")
        nil
      end
    end

    cooked = result.to_html if result.changed?
    cooked
  end

  # How many images are present in the post
  def image_count
    return 0 unless @source.present?

    cooked_document.search("img").reject do |t|
      dom_class = t["class"]
      if dom_class
        (Message.white_listed_image_classes & dom_class.split(" ")).count > 0
      end
    end.count
  end

  # How many attachments are present in the post
  def attachment_count
    return 0 unless @source.present?

    attachments = cooked_document.css("a.attachment[href^=\"#{CarrierWave::Uploader::Base.fog_directory}\"]")
    attachments += cooked_document.css("a.attachment[href^=\"/uploads\"]")
    attachments.count
  end

  # Count how many hosts are linked in the post
  def linked_hosts
    return {} if raw_links.blank?
    return @linked_hosts if @linked_hosts.present?

    @linked_hosts = {}

    raw_links.each do |u|
      begin
        uri = URI.parse(u)
        host = uri.host
        @linked_hosts[host] ||= 1
      rescue URI::InvalidURIError
        # An invalid URI does not count as a source link.
        next
      end
    end

    @linked_hosts
  end

  # Returns an array of all links in a post excluding mentions
  def raw_links
    return [] unless @source.present?
    return @raw_links if @raw_links.present?

    # Don't include @mentions in the link count
    @raw_links = []

    cooked_document.search("a").each do |l|
      next if l.attributes['href'].nil? || link_is_a_mention?(l)
      url = l.attributes['href'].to_s
      @raw_links << url
    end

    @raw_links
  end

  # How many links are present in the post
  def link_count
    raw_links.size
  end

  private

  def cooked_document
    @cooked_document ||= Nokogiri::HTML.fragment(cook(@source))
  end
end
