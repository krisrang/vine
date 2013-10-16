require 'site_setting_extension'

class SiteSetting < ActiveRecord::Base
  extend SiteSettingExtension

  validates_presence_of :name
  validates_presence_of :data_type

  client_setting(:title, "Discourse")
  setting(:site_description, '')
end