class UploadsController < ApplicationController
  before_filter :ensure_logged_in, only: [:create]

  def create
    file = params[:file] || params[:files].first

    # check if the extension is allowed
    unless SiteSetting.authorized_upload?(file)
      text = I18n.t("upload.unauthorized", authorized_extensions: SiteSetting.authorized_extensions.gsub("|", ", "))
      return render status: 415, text: text
    end

    # check the file size
    filesize = File.size(file.tempfile)
    type = SiteSetting.authorized_image?(file) ? "image" : "attachment"
    max_size_kb = SiteSetting.send("max_#{type}_size_kb").kilobytes

    if filesize > max_size_kb
      return render status: 413, text: I18n.t("upload.#{type}s.too_large", max_size_kb: max_size_kb)
    end

    upload = Upload.create_for(current_user, file)

    render json: UploadSerializer.new(upload, root:false)
  end

  # /uploads/sha.jpg
  def show
    sha = params[:sha].downcase
    upload = Upload.where("sha LIKE ?", "#{sha}%").first

    return render nothing: true, status: 404 unless upload

    redirect_to upload.file.url
  end
end
