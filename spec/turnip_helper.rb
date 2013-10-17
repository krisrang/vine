require 'turnip/capybara'
require 'capybara/poltergeist'
Capybara.javascript_driver = :poltergeist

Dir.glob("spec/steps/**/*steps.rb") { |f| load f, true }