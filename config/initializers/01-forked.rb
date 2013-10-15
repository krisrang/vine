if defined?(PhusionPassenger)
  PhusionPassenger.on_event(:starting_worker_process) do |forked|

    if forked # We're in smart spawning mode.
      Analytics = AnalyticsRuby
      Analytics.init(secret: Figaro.env.analytics)
    else
      # We're in direct spawning mode. We don't need to do anything.
    end
  end
end