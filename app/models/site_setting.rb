require 'site_setting_extension'

class SiteSetting < ActiveRecord::Base
  extend SiteSettingExtension

  validates_presence_of :name
  validates_presence_of :data_type

  setting(:default_locale, 'en', enum: 'LocaleSiteSetting')

  client_setting(:title, "Vine")
  
  client_setting(:email_domains_blacklist, 'mailinator.com')
  client_setting(:email_domains_whitelist)

  client_setting(:enable_long_polling, true)
  setting(:long_polling_interval, 15000)

  setting(:active_user_rate_limit_secs, 60)

  def self.save_override(name, value, data_type)
    count = SiteSetting.where({
      name: name
    }).update_all({
      name: name,
      value: value,
      data_type: data_type,
      updated_at: Time.now
    })

    if count == 0
      SiteSetting.create!(name: name, value: value, data_type: data_type)
    end

    true
  end

  protected

  def self.destroy_override(name)
    SiteSetting.where(name: name).destroy_all
  end
end