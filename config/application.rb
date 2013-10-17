require File.expand_path('../boot', __FILE__)

require 'rails/all'

# Require the gems listed in Gemfile, including any gems
# you've limited to :test, :development, or :production.
Bundler.require(:default, Rails.env)

module Vine
  class Application < Rails::Application
    require 'vine'

    require 'vine_redis'
    config.cache_store = VineRedis.new_redis_store

    config.autoload_paths += Dir["#{config.root}/app/serializers"]
    config.autoload_paths += Dir["#{config.root}/lib/validators/"]

    # nginx does whatever caching necessary
    config.action_dispatch.rack_cache = nil

    require 'js_locale_helper'
    config.assets.paths += %W(#{config.root}/config/locales)

    Dir.glob("#{config.root}/app/assets/javascripts/locales/*.js.erb").each do |file|
      config.assets.precompile << "locales/#{file.match(/([a-z_A-Z]+\.js)\.erb$/)[1]}"
    end

    # per https://www.owasp.org/index.php/Password_Storage_Cheat_Sheet
    config.pbkdf2_iterations = 64000
    config.pbkdf2_algorithm = "sha256"

    # Set Time.zone default to the specified zone and make Active Record auto-convert to this zone.
    # Run "rake -D time" for a list of tasks for finding time zone names. Default is UTC.
    # config.time_zone = 'Central Time (US & Canada)'

    # The default locale is :en and all translations from config/locales/*.rb,yml are auto loaded.
    # config.i18n.load_path += Dir[Rails.root.join('my', 'locales', '*.{rb,yml}').to_s]
    # config.i18n.default_locale = :de
  end
end

require 'faye'
require 'faye/redis'

faye = Faye::RackAdapter.new(
  Rails.application,
  mount: '/faye', 
  timeout: 25,
  engine: {
    type: Faye::Redis,
    uri: VineRedis.faye_url
})

Faye.logger = Logger.new(File.join(Rails.root, 'log/faye.log'))
Faye.ensure_reactor_running!

$fayerack = faye
$faye = faye.get_client