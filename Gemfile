source 'https://rubygems.org'

gem 'rails', '4.0.0'
gem 'pg'

### FRONTEND

gem 'sass-rails'
gem 'uglifier'
gem 'bourbon'
gem 'jquery-rails'
# gem 'turbolinks'
# gem 'therubyracer', platforms: :ruby

gem 'slim-rails'
gem 'simple_form', github: 'plataformatec/simple_form'
gem 'jbuilder'
gem 'gon'
gem 'ember-rails'

### REAR END

gem 'figaro'
gem 'analytics-ruby'
gem 'bcrypt-ruby', '~> 3.0.0' # sorcery hack
gem 'cancan'
gem 'sorcery'
gem 'uuidtools'
gem 'whenever', require: false

group :doc do
  # bundle exec rake doc:rails generates the API under doc/api.
  gem 'sdoc', require: false
end

group :development do
  gem 'letter_opener'
end

group :development, :test do
  gem 'quiet_assets'
  gem 'rspec-rails'
  gem 'guard-rspec'
  gem 'factory_girl_rails'
end

group :test do
  gem 'simplecov', require: false
end

group :production do
  gem 'rails_12factor'
end
