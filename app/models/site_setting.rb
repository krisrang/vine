require 'site_setting_extension'

class SiteSetting < ActiveRecord::Base
  extend SiteSettingExtension

  validates_presence_of :name
  validates_presence_of :data_type

  setting(:default_locale, 'en', enum: 'LocaleSiteSetting')
  client_setting(:title, "Vine")

  setting(:api_key, '')

  client_setting(:traditional_markdown_linebreaks, false)

  client_setting(:must_approve_users, false)
  client_setting(:login_required, true)

  client_setting(:enable_local_logins, true)
  client_setting(:enable_local_account_create, true)

  client_setting(:enable_google_logins, true)
  client_setting(:enable_persona_logins, true)
  
  client_setting(:email_domains_blacklist, 'mailinator.com')
  client_setting(:email_domains_whitelist)

  client_setting(:polling_interval, 3000)
  client_setting(:enable_long_polling, true)
  setting(:long_polling_interval, 15000)

  client_setting(:min_message_length, Rails.env.test? ? 5 : 10)

  setting(:active_user_rate_limit_secs, 60)
  setting(:previous_visit_timeout_hours, 1)

  setting(:analytics_code, 'urza14xmgm')

  setting(:hostname, Rails.env.development? ? 'localhost' : 'forum.rang.ee')
  setting(:port, Rails.env.development? ? 5000 : '')
  setting(:use_ssl, false)

  setting(:notification_email, 'forum@rang.ee')
  setting(:email_custom_headers, '')

  setting(:reply_by_email_enabled, false)
  setting(:reply_by_email_address, '')

  setting(:email_editable, true)
  
  setting(:crawl_images, true)

  client_setting(:enable_mobile_theme, true)

  setting(:add_rel_nofollow_to_user_content, true)
  setting(:exclude_rel_nofollow_domains, '')

  client_setting(:max_image_size_kb, 5120)
  client_setting(:max_image_width, 690)
  client_setting(:max_image_height, 500)
  client_setting(:max_attachment_size_kb, 10240)
  client_setting(:authorized_extensions, '.jpg|.jpeg|.png|.gif')

  setting(:download_remote_images_to_local, true)
  setting(:download_remote_images_threshold, 10)

  setting(:ninja_edit_window, 300)

  def self.generate_api_key!
    self.api_key = SecureRandom.hex(32)
  end

  def self.api_key_valid?(tested)
    t = tested.strip
    t.length == 64 && t == self.api_key
  end

  def self.authorized_uploads
    authorized_extensions.tr(" ", "")
                         .split("|")
                         .map { |extension| (extension.start_with?(".") ? extension[1..-1] : extension).gsub(".", "\.") }
  end

  def self.authorized_upload?(file)
    authorized_uploads.count > 0 && file.original_filename =~ /\.(#{authorized_uploads.join("|")})$/i
  end

  def self.images
    @images ||= Set.new ["jpg", "jpeg", "png", "gif", "tif", "tiff", "bmp"]
  end

  def self.authorized_images
    authorized_uploads.select { |extension| images.include?(extension) }
  end

  def self.authorized_image?(file)
    authorized_images.count > 0 && file.original_filename =~ /\.(#{authorized_images.join("|")})$/i
  end
  
  
  ## API METHODS

  def self.save_override(name, value, data_type)
    data = {
      name: name,
      value: value,
      data_type: data_type,
      updated_at: Time.now
    }

    count = SiteSetting.where(name: name).update_all(data)

    if count == 0
      SiteSetting.create!(data)
    end

    true
  end

  protected

  def self.destroy_override(name)
    SiteSetting.where(name: name).destroy_all
  end
end