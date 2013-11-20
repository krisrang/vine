# encoding: utf-8

require 'carrierwave/processing/mime_types'

class AvatarUploader < CarrierWave::Uploader::Base
  include CarrierWave::MimeTypes
  include CarrierWave::MiniMagick

  before :cache, :reset_secure_token

  def store_dir
    "uploads/user_avatar/#{model.id}"
  end

  def filename
     "#{secure_token(10)}.#{file.extension}" if original_filename.present?
  end

  def default_url
    ActionController::Base.helpers.asset_path("avatar/" + [version_name, "default.png"].compact.join('_'))
  end

  process :set_content_type

  version :thumb do
    process resize_to_fill: [45, 45]
  end

  def extension_white_list
    %w(jpg jpeg gif png)
  end

  protected

  def secure_token(length = 16)
    model.avatar_secure_token ||= SecureRandom.hex(length / 2)
  end

  def reset_secure_token(file)
    model.avatar_secure_token = nil
  end
end
