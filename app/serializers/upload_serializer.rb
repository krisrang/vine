class UploadSerializer < ApplicationSerializer
  attributes :url, :original_filename, :size, :width, :height, :client_width, :client_height

  def url
    # upload_path(sha: object.sha[0..15], extension: File.extname(object.original_filename)[1..-1])
    object.file.url
  end
end
