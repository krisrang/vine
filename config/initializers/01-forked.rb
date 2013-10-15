require "#{Rails.root}/lib/vine_redis"

$redis = VineRedis.new

if Rails.env.development? && ENV['FLUSH_REDIS']
  puts "Flushing redis (development mode)"
  $redis.flushall
end

if defined?(PhusionPassenger)
  PhusionPassenger.on_event(:starting_worker_process) do |forked|
    if forked
      # We're in smart spawning mode.
      $redis = VineRedis.new
      Vine::Application.config.cache_store.reconnect
      
      Analytics = AnalyticsRuby
      Analytics.init(secret: Figaro.env.analytics)
    else
      # We're in conservative spawning mode. We don't need to do anything.
    end
  end
end