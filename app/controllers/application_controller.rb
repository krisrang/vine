require 'current_user'

class ApplicationController < ActionController::Base
  include CurrentUser
  
  protect_from_forgery

  before_filter :preload_json
  before_filter :set_locale

  def set_locale
    I18n.locale = SiteSetting.default_locale
  end

  def store_preloaded(key, json)
    @preloaded ||= {}
    # I dislike that there is a gsub as opposed to a gsub!
    #  but we can not be mucking with user input, I wonder if there is a way
    #  to inject this safty deeper in the library or even in AM serializer
    @preloaded[key] = json.gsub("</", "<\\/")
  end

  def preload_json
    log_on_user(User.first)
    return if request.xhr?

    preload_anonymous_data

    if current_user
      preload_current_user_data
    end
  end

  private

  def preload_anonymous_data
    store_preloaded("settings", SiteSetting.client_settings_json)
  end

  def preload_current_user_data
    store_preloaded("currentUser", MultiJson.dump(CurrentUserSerializer.new(current_user, root: false)))
  end
end
