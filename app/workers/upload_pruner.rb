class UploadPruner
  include Sidekiq::Worker
  include Sidetiq::Schedulable

  recurrence { daily }

  def perform
    return unless SiteSetting.clean_up_uploads?

    uploads_used_in_messages = MessagesUploads.uniq.pluck(:upload_id)
    grace_period = [SiteSetting.uploads_grace_period_in_hours, 1].max

    Upload.where("created_at < ?", grace_period.hour.ago)
          .where("id NOT IN (?)", uploads_used_in_messages)
          .find_each do |upload|
      upload.destroy
    end
  end
end