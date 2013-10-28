require_dependency 'auth/local_user_provider'

module Vine
  # Expected less matches than what we got in a find
  class TooManyMatches < Exception; end

  # When they try to do something they should be logged in for
  class NotLoggedIn < Exception; end

  # When the input is somehow bad
  class InvalidParameters < Exception; end

  # When they don't have permission to do something
  class InvalidAccess < Exception; end

  # When something they want is not found
  class NotFound < Exception; end

  # When a setting is missing
  class SiteSettingMissing < Exception; end

  # Cross site request forgery
  class CSRF < Exception; end

  def self.current_hostname
    SiteSetting.hostname
  end

  def self.base_url
    default_port = 80
    protocol = "http"

    if SiteSetting.use_ssl?
      protocol = "https"
      default_port = 443
    end

    result = "#{protocol}://#{current_hostname}"

    port = SiteSetting.port.present? && SiteSetting.port.to_i > 0 ? SiteSetting.port.to_i : default_port

    result << ":#{SiteSetting.port}" if port != default_port
    result
  end

  def self.git_version
    return $git_version if $git_version

    begin
      $git_version ||= `git rev-parse HEAD`.strip
    rescue
      $git_version = "unknown"
    end
  end

  def self.authenticators
    Users::OmniauthCallbacksController::BUILTIN_AUTH
  end

  def self.current_user_provider
    @current_user_provider || Auth::LocalUserProvider
  end

  def self.current_user_provider=(val)
    @current_user_provider = val
  end

  def self.enable_maintenance_mode
    $redis.set maintenance_mode_key, 1
    true
  end

  def self.disable_maintenance_mode
    $redis.del maintenance_mode_key
    true
  end

  def self.maintenance_mode?
    !!$redis.get( maintenance_mode_key )
  end

private

  def self.maintenance_mode_key
    'maintenance_mode'
  end
end
