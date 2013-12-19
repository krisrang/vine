source 'https://rubygems.org'
ruby '2.0.0'

### REAR END

gem 'rails', '~> 4.0.2'
gem 'pg'

gem 'hiredis'
gem 'redis', :require => ["redis", "redis/connection/hiredis"]
gem 'redis-rails'

gem 'faye'
gem 'message_bus', github: 'SamSaffron/message_bus'


### FRONTEND

gem 'less-rails'
gem 'sass-rails'
gem 'uglifier'
gem 'bourbon'
gem 'jquery-rails'
gem 'slim-rails'
gem 'simple_form'
gem 'jbuilder'
gem 'ember-rails'
gem 'gemoji', github: 'github/gemoji'


### MISC

gem 'omniauth'
gem 'omniauth-openid'
gem 'openid-redis-store'
gem 'omniauth-oauth2', require: false
gem 'omniauth-browserid', git: 'https://github.com/callahad/omniauth-browserid.git', branch: 'observer_api'
gem 'active_model_serializers'
gem 'sidekiq'
gem 'sidetiq'
gem 'sidekiq-failures'
gem 'sinatra', require: nil
gem 'therubyracer', require: 'v8'
gem 'postmark-rails'
gem 'figaro'
gem 'analytics-ruby'
gem 'bcrypt-ruby'
gem 'uuidtools'
gem 'oj'
gem 'lru_redux'
gem 'fast_xor'
gem 'seed-fu'
gem 'carrierwave'
gem 'carrierwave-imageoptimizer'
gem 'fog'
gem 'mini_magick'
gem 'unf'
gem 'authority'
gem 'nokogiri'
gem 'fastimage'
gem 'seed-fu'
gem 'paper_trail', '>= 3.0.0.rc2'
gem 'mustache'
gem 'rinku'

group :development do
  gem 'letter_opener'
  gem 'better_errors'
  gem 'binding_of_caller'
end

group :development, :test do
  gem 'fabrication', require: false
  gem 'mocha', require: false
  gem 'listen', '0.7.3', require: false
  gem 'certified', require: false
  gem 'qunit-rails'
  gem 'quiet_assets'
  gem 'guard-rspec'
  gem 'rspec-rails'
  gem 'pry-rails'
  gem 'rspec-given'
  gem 'shoulda', require: false
  gem 'simplecov', require: false
  gem 'spork-rails', :github => 'sporkrb/spork-rails'
  gem 'rb-fsevent', require: RUBY_PLATFORM =~ /darwin/i ? 'rb-fsevent' : false
  gem 'rb-inotify', '~> 0.9', require: RUBY_PLATFORM =~ /linux/i ? 'rb-inotify' : false
end

group :test do
  gem 'fakeweb'
end

group :production do
  gem 'rails_12factor'
  gem 'sentry-raven', github: "getsentry/raven-ruby"
end


gem 'rack-mini-profiler', '0.9.0.pre'

# possible servers
gem 'puma', require: false
gem 'thin', require: false
