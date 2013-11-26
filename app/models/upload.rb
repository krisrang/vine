require "digest/sha1"
require_dependency 'image_sizer'

class Upload < ActiveRecord::Base  
  mount_uploader :file, AttachmentUploader

  belongs_to :user
  has_and_belongs_to_many :messages

  before_save :save_meta

  def self.create_for(user, file)
    sha = Digest::SHA1.file(file.tempfile).hexdigest
    upload = Upload.where(sha: sha).first

    # create the upload
    unless upload
      upload = Upload.new(user: user, file: file, sha: sha)
      upload.save!
    end

    upload
  end

  def save_meta
    begin
      image = MiniMagick::Image.open(file.path)
      self.width = image[:width] 
      self.height = image[:height]

      self.client_width, self.client_height = ImageSizer.resize(width, height)
    rescue MiniMagick::Invalid
    end

    self.size = file.size
    self.content_type = file.file.content_type
    self.original_filename = file.file.original_filename
  end
end