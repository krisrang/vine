MessageBus.site_id_lookup do
  "default"
end

MessageBus.user_id_lookup do |env|
  user = CurrentUser.lookup_from_env(env)
  user.id if user
end

MessageBus.is_admin_lookup do |env|
  user = CurrentUser.lookup_from_env(env)
  user && user.admin ? true : false
end

# MessageBus.group_ids_lookup do |env|
#   user = CurrentUser.lookup_from_env(env)
#   user.groups.select('groups.id').map{|g| g.id} if user
# end

# MessageBus.on_connect do |site_id|
#   RailsMultisite::ConnectionManagement.establish_connection(db: site_id)
# end

MessageBus.on_disconnect do |site_id|
  ActiveRecord::Base.connection_handler.clear_active_connections!
end

# Point at our redis
MessageBus.redis_config = VineRedis.config.symbolize_keys

MessageBus.long_polling_enabled = SiteSetting.enable_long_polling
MessageBus.long_polling_interval = SiteSetting.long_polling_interval
MessageBus.rack_hijack_enabled = true

MessageBus.cache_assets = !Rails.env.development?
MessageBus.enable_diagnostics