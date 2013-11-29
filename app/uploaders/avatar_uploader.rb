# encoding: utf-8
require 'carrierwave/processing/mime_types'

class AvatarUploader < CarrierWave::Uploader::Base
  include CarrierWave::MimeTypes
  include CarrierWave::MiniMagick
  include CarrierWave::ImageOptimizer
  def store_dir
    "uploads/user_avatar/#{model.id}"
  end

  def default_url
    ActionController::Base.helpers.asset_path("avatar/" + [version_name, "default.png"].compact.join('_'))
  end

  process :optimize
  process :set_content_type

  version :thumb do
    process resize_to_fill: [45, 45]
  end

  version :profile do
    process resize_to_fill: [128, 128]
  end

  def extension_white_list
    %w(jpg jpeg gif png)
  end
end
