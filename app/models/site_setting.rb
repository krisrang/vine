require 'site_setting_extension'

class SiteSetting < ActiveRecord::Base
  extend SiteSettingExtension

  validates_presence_of :name
  validates_presence_of :data_type

  setting(:default_locale, 'en', enum: 'LocaleSiteSetting')

  client_setting(:title, "Vine")

  setting(:api_key, '')

  client_setting(:login_required, false)
  
  client_setting(:email_domains_blacklist, 'mailinator.com')
  client_setting(:email_domains_whitelist)

  client_setting(:enable_long_polling, true)
  setting(:long_polling_interval, 15000)

  setting(:active_user_rate_limit_secs, 60)
  setting(:previous_visit_timeout_hours, 1)

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