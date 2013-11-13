require 'faye'
require 'faye/redis'
require 'vine_redis'

module Bus
  def self.setup_faye
    faye = Faye::RackAdapter.new(
      Rails.application,
      mount: '/faye', 
      timeout: 25,
      engine: {
        type: Faye::Redis,
        uri: VineRedis.faye_url
    })

    # Faye.logger = Logger.new(File.join(Rails.root, 'log/faye.log'))
    Faye.ensure_reactor_running!

    $fayerack = faye

    $fayerack.get_client.subscribe('/foo') do |message|
      puts message.inspect
    end
  end

  def self.client
    @client ||= begin
      Faye.ensure_reactor_running!
      $fayerack.get_client
    end
  end
end