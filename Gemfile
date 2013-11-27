source 'https://rubygems.org'

### REAR END

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
gem 'gemoji'


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

group :development do
  gem 'foreman'
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


gem 'flamegraph', git: 'https://github.com/SamSaffron/flamegraph.git'
gem 'rack-mini-profiler',  git: 'https://github.com/MiniProfiler/rack-mini-profiler.git',  ref: '5f2048351f5f8ed7cffa2943539a7cc97f0a9764'

gem 'puma', require: false
gem 'thin', require: false

