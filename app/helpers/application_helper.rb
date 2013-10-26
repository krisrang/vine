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
end
