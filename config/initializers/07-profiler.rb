# If Mini Profiler is included via gem
if Rails.configuration.respond_to?(:enable_mini_profiler) && Rails.configuration.enable_mini_profiler
  require 'rack-mini-profiler'
  require 'flamegraph'
  # initialization is skipped so trigger it
  Rack::MiniProfilerRails.initialize!(Rails.application)
end

if defined?(Rack::MiniProfiler)
  Rack::MiniProfiler.config.storage_instance = Rack::MiniProfiler::RedisStore.new(connection: VineRedis.raw_connection)

  # For our app, let's just show mini profiler always, polling is chatty so nuke that
  Rack::MiniProfiler.config.pre_authorize_cb = lambda do |env|
    (env['HTTP_USER_AGENT'] !~ /iPad|iPhone|Nexus 7/) &&
    (env['PATH_INFO'] !~ /^\/message-bus/) &&
    (env['PATH_INFO'] !~ /assets/) &&
    (env['PATH_INFO'] !~ /qunit/) &&
    (env['PATH_INFO'] !~ /font/) &&
    (env['PATH_INFO'] !~ /favicon/)
  end

  # without a user provider our results will use the ip address for namespacing
  #  with a load balancer in front this becomes really bad as some results can
  #  be stored associated with ip1 as the user and retrieved using ip2 causing 404s
  Rack::MiniProfiler.config.user_provider = lambda do |env|
    request = Rack::Request.new(env)
    id = request.cookies["_t"] || request.ip || "unknown"
    id = id.to_s
    # some security, lets not have these tokens floating about
    Digest::MD5.hexdigest(id)
  end

  Rack::MiniProfiler.config.position = 'left'
  Rack::MiniProfiler.config.backtrace_ignores ||= []
  Rack::MiniProfiler.config.backtrace_ignores << /lib\/rack\/message_bus.rb/
  Rack::MiniProfiler.config.backtrace_ignores << /config\/initializers\/quiet_logger/
end
