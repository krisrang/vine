# if Rails.configuration.respond_to?(:enable_mini_profiler) && Rails.configuration.enable_mini_profiler
#   require 'rack-mini-profiler'
#   require 'flamegraph'

#   # initialization is skipped so trigger it
#   Rack::MiniProfilerRails.initialize!(Rails.application)
# end

if defined?(Rack::MiniProfiler)
  Rack::MiniProfiler.config.storage_instance = Rack::MiniProfiler::RedisStore.new(connection: VineRedis.raw_connection)

  # For our app, let's just show mini profiler always, polling is chatty so nuke that
  Rack::MiniProfiler.config.pre_authorize_cb = lambda do |env|
    (env['HTTP_USER_AGENT'] !~ /iPad|iPhone|Nexus 7/) &&
    (env['PATH_INFO'] !~ /^\/message-bus/) &&
    (env['PATH_INFO'] !~ /assets/) &&
    (env['PATH_INFO'] !~ /qunit/) &&
    (env['PATH_INFO'] !~ /sidekiq/) &&
    (env['PATH_INFO'] !~ /font/) &&
    (env['PATH_INFO'] !~ /uploads/) &&
    (env['PATH_INFO'] !~ /favicon/)
  end

  Rack::MiniProfiler.config.user_provider = Proc.new { |env| 
    request = Rack::Request.new(env)
    id = (request.cookies["_t"] || request.ip || "unknown").to_s
    Digest::MD5.hexdigest(id)
  }

  Rack::MiniProfiler.config.position = 'left'
  Rack::MiniProfiler.config.backtrace_ignores ||= []
  Rack::MiniProfiler.config.backtrace_ignores << /lib\/rack\/message_bus.rb/
  Rack::MiniProfiler.config.backtrace_ignores << /config\/initializers\/quiet_logger/
end
