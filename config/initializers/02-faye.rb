class FayeLogger
  def incoming(message, callback)
    time = Time.now
    formatted_time = time.strftime("%Y-%m-%d %H:%M:%S.") << time.usec.to_s[0..2].rjust(3)
    color = 32

    Rails.logger.info
    Rails.logger.info "Faye message on \"#{message["channel"]}\" from \"#{message["clientId"]}\" at #{formatted_time}"
    Rails.logger.info "  #{message}"
    
    callback.call(message)
  end
end

$faye.add_extension(FayeLogger.new)