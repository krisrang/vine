require 'current_user'

module ApplicationHelper
  include CurrentUser

  def vine_csrf_tags
    # anon can not have a CSRF token cause these are all pages
    # that may be cached, causing a mismatch between session CSRF
    # and CSRF on page and horrible impossible to debug login issues
    if current_user
      csrf_meta_tags
    end
  end

  def escape_unicode(javascript)
    if javascript
      javascript = javascript.dup.force_encoding("utf-8")
      javascript.gsub!(/\342\200\250/u, '&#x2028;')
      javascript.gsub!(/(<\/)/u, '\u003C/')
      javascript.html_safe
    else
      ''
    end
  end

  def admin?
    current_user.try(:admin?)
  end

  def render_analytics
    if Rails.env.production? && SiteSetting.analytics_code.present?
      render partial: "common/analytics"
    end
  end

  def asset_data_uri path
    asset = Rails.application.assets.find_asset path

    throw "Could not find asset '#{path}'" if asset.nil?

    base64 = Base64.encode64(asset.to_s).gsub(/\s+/, "")
    "data:#{asset.content_type};base64,#{Rack::Utils.escape(base64)}"
  end

  def html_classes
    "#{mobile_view? ? 'mobile-view' : 'desktop-view'} #{mobile_device? ? 'mobile-device' : 'not-mobile-device'}"
  end

  def mobile_view?
    return false unless SiteSetting.enable_mobile_theme
    if session[:mobile_view]
      session[:mobile_view] == '1'
    else
      mobile_device?
    end
  end

  def mobile_device?
    # TODO: this is dumb. user agent matching is a doomed approach. a better solution is coming.
    request.user_agent =~ /Mobile|webOS|Nexus 7/ and !(request.user_agent =~ /iPad/)
  end

  def mini_profiler_enabled?
    defined?(Rack::MiniProfiler) && admin?
  end
end
