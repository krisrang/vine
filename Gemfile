source 'https://rubygems.org'

### REAR END

gem 'puma', require: false

gem 'rails', github: 'rails/rails', branch: '4-0-stable'
gem 'pg'

gem 'hiredis'
gem 'redis', :require => ["redis", "redis/connection/hiredis"]
gem 'redis-rails'
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


### MISC

gem 'omniauth'
gem 'omniauth-openid'
gem 'openid-redis-store'
gem 'omniauth-oauth2', require: false
gem 'omniauth-browserid', git: 'https://github.com/callahad/omniauth-browserid.git', branch: 'observer_api'
gem 'sentry-raven', github: "getsentry/raven-ruby"
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

group :development do
  gem 'foreman'
  gem 'letter_opener'
end

group :development, :test do
  gem 'quiet_assets'
  gem 'factory_girl_rails'
  gem 'rspec-rails'
  gem 'turnip'
  gem 'poltergeist'
  gem 'guard-rspec'
end

group :test do
  gem 'simplecov', require: false
end

group :production do
  gem 'rails_12factor'
end
