if ENV['COVERAGE']
  require 'simplecov'
  SimpleCov.start
end

require 'rubygems'
require 'spork'
#uncomment the following line to use spork with the debugger
#require 'spork/ext/ruby-debug'

require 'fakeweb'
FakeWeb.allow_net_connect = false

Spork.prefork do
  # Loading more in this block will cause your tests to run faster. However,
  # if you change any configuration or code from libraries loaded here, you'll
  # need to restart spork for it take effect.
  require 'fabrication'
  require 'mocha/api'
  require 'fakeweb'
  require 'certified'

  # This file is copied to spec/ when you run 'rails generate rspec:install'
  ENV["RAILS_ENV"] ||= 'test'
  require File.expand_path("../../config/environment", __FILE__)
  require 'rspec/rails'
  require 'rspec/autorun'
  require 'shoulda'

  # Requires supporting ruby files with custom matchers and macros, etc,
  # in spec/support/ and its subdirectories.
  Dir[Rails.root.join("spec/support/**/*.rb")].each { |f| require f }

  # let's not run seed_fu every test
  SeedFu.quiet = true if SeedFu.respond_to? :quiet
  SeedFu.seed

  # Checks for pending migrations before tests are run.
  # If you are not using ActiveRecord, you can remove this line.
  ActiveRecord::Migration.check_pending! if defined?(ActiveRecord::Migration)

  RSpec.configure do |config|
    config.fail_fast = ENV['RSPEC_FAIL_FAST'] == "1"
    config.include Helpers
    config.include MessageBus
    config.mock_framework = :mocha
    config.order = 'random'

    # If you're not using ActiveRecord, or you'd prefer not to run each of your
    # examples within a transaction, remove the following line or assign false
    # instead of true.
    config.use_transactional_fixtures = true

    # If true, the base class of anonymous controllers will be inferred
    # automatically. This will be the default behavior in future versions of
    # rspec-rails.
    config.infer_base_class_for_anonymous_controllers = true

    # if we need stuff post fork, pre tests run here
    # config.before(:suite) do
    # end

    config.before do
      SiteSetting.all.each do |setting|
        SiteSetting.remove_override!(setting.name)
      end
    end

    class TestCurrentUserProvider < Auth::LocalUserProvider
      def log_on_user(user,session,cookies)
        session[:current_user_id] = user.id
        super
      end

      def log_off_user(session,cookies)
        session[:current_user_id] = nil
        super
      end
    end

    def freeze_time(now=Time.now)
      DateTime.stubs(:now).returns(DateTime.parse(now.to_s))
      Time.stubs(:now).returns(Time.parse(now.to_s))
    end
  end
end

Spork.each_run do
  # This code will be run each time you run your specs.
  $redis.client.reconnect
  Rails.cache.reconnect
  MessageBus.after_fork
end
