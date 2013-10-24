require 'raven'

Raven.configure do |config|
  config.dsn = Figaro.env.raven_dsn
end