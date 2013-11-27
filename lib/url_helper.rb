module UrlHelper

  def is_local(url)
    url =~ /^\/assets\// || url =~ /^\/images\//
  end

  def is_upload(url)
    url.include?(CarrierWave::Uploader::Base.fog_directory)
  end

  def schemaless(url)
    url.gsub(/^https?:/, "")
  end

end
