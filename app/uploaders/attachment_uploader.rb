# encoding: utf-8
require 'carrierwave/processing/mime_types'

class AttachmentUploader < CarrierWave::Uploader::Base
  include CarrierWave::MimeTypes
  include CarrierWave::MiniMagick

  def store_dir
    "uploads/attachment/#{model.id}"
  end

  # def default_url
  #   ActionController::Base.helpers.asset_path("avatar/" + [version_name, "default.png"].compact.join('_'))
  # end

  process :set_content_type

  version :thumb, :if => :image? do
    process resize_to_fit: [SiteSetting.max_image_width.to_f, SiteSetting.max_image_height.to_f]
  end

  def extension_white_list
    SiteSetting.authorized_uploads
  end

  protected

  def image?(upload)
    upload.content_type.include? 'image'
  end
end
