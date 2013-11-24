class UploadSerializer < ApplicationSerializer
  attributes :url, :original_filename, :size, :width, :height

  def url
    object.file.url
  end
end
