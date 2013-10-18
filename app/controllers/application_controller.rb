require 'current_user'

class ApplicationController < ActionController::Base
  include CurrentUser
  
  protect_from_forgery

  def handle_unverified_request
    # NOTE: API key is secret, having it invalidates the need for a CSRF token
    unless is_api?
      super
      clear_current_user
      render text: "['BAD CSRF']", status: 403
    end
  end

  before_filter :block_if_maintenance_mode
  before_filter :preload_json
  before_filter :set_locale
  before_filter :redirect_to_login_if_required

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
    return if request.xhr?

    preload_anonymous_data

    if current_user
      preload_current_user_data
    end
  end

  def serialize_data(obj, serializer, opts={})
    # If it's an array, apply the serializer as an each_serializer to the elements
    # serializer_opts = {scope: guardian}.merge!(opts)
    if obj.is_a?(Array)
      serializer_opts[:each_serializer] = serializer
      ActiveModel::ArraySerializer.new(obj, serializer_opts).as_json
    else
      serializer.new(obj, serializer_opts).as_json
    end
  end

  def render_serialized(obj, serializer, opts={})
    render_json_dump(serialize_data(obj, serializer, opts))
  end

  def render_json_dump(obj)
    render json: MultiJson.dump(obj)
  end

  private

  def preload_anonymous_data
    store_preloaded("settings", SiteSetting.client_settings_json)
  end

  def preload_current_user_data
    store_preloaded("currentUser", MultiJson.dump(CurrentUserSerializer.new(current_user, root: false)))
  end

  def success_json
    {success: 'OK'}
  end

  def failed_json
    {failed: 'FAILED'}
  end

  def block_if_maintenance_mode
    if Vine.maintenance_mode?
      if request.format.json?
        render status: 503, json: failed_json.merge(message: I18n.t('site_under_maintenance'))
      else
        render status: 503, file: File.join( Rails.root, 'public', '503.html' ), layout: false
      end
    end
  end

  def ensure_logged_in
    raise Vine::NotLoggedIn.new unless current_user.present?
  end

  def redirect_to_login_if_required
    redirect_to :login if SiteSetting.login_required? && !current_user
  end

  protected

  def api_key_valid?
    request["api_key"] && SiteSetting.api_key_valid?(request["api_key"])
  end
end
