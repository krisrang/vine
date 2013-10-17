module ApplicationHelper
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
end
