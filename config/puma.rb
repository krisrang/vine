#!/usr/bin/env puma

vine_path = File.expand_path(File.expand_path(File.dirname(__FILE__)) + "/../")

environment ENV['RAILS_ENV']

directory vine_path
rackup "#{vine_path}/config.ru"

pidfile "#{vine_path}/tmp/pids/puma.pid"
state_path "#{vine_path}/tmp/pids/puma.state"

bind "tcp://0.0.0.0:#{ENV['PORT']}"

on_restart do
  ActiveRecord::Base.connection.disconnect!
  $redis.client.disconnect
end

# restart_command '/u/app/lolcat/bin/restart_puma'

# daemonize
# daemonize false

# stdout_redirect "#{vine_path}/log/puma.log", "#{vine_path}/log/puma.err.log", true

# Disable request logging.
# quiet

# threads 0, 16

# === Cluster mode ===

workers 3

# woot for Ruby 2.0
preload_app!

on_worker_boot do
  ActiveSupport.on_load(:active_record) do
    ActiveRecord::Base.establish_connection
  end

  $redis = VineRedis.new
  Vine::Application.config.cache_store.reconnect
  Rails.cache.reconnect
  MessageBus.after_fork
end

# === Puma control rack application ===

activate_control_app "unix://#{vine_path}/tmp/sockets/pumactl-vine.sock", { auth_token: ENV['PUMA_TOKEN'] }