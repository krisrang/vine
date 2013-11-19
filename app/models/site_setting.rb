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

  client_setting(:enable_mobile_theme, true)

  setting(:add_rel_nofollow_to_user_content, true)
  setting(:exclude_rel_nofollow_domains, '')

  def self.generate_api_key!
    self.api_key = SecureRandom.hex(32)
  end

  def self.api_key_valid?(tested)
    t = tested.strip
    t.length == 64 && t == self.api_key
  end

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