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
  before_filter :authorize_mini_profiler
  before_filter :preload_json
  before_filter :check_xhr
  before_filter :set_locale
  before_filter :redirect_to_login_if_required

  class RenderEmpty < Exception; end

  # Render nothing unless we are an xhr request
  rescue_from RenderEmpty do
    render 'common/empty'
  end

  rescue_from Vine::NotLoggedIn do |e|
    raise e if Rails.env.test?
    redirect_to "/"
  end

  rescue_from Vine::NotFound do
    rescue_vine_actions("[error: 'not found']", 404)
  end

  rescue_from Vine::InvalidAccess do
    rescue_vine_actions("[error: 'invalid access']", 403)
  end

  def rescue_vine_actions(message, error)
    if request.format && request.format.json?
      render status: error, layout: false, text: (error == 404) ? build_not_found_page(error) : message
    else
      render text: build_not_found_page(error, 'no_js')
    end
  end

  def authority_forbidden(error)
    Authority.logger.warn(error.message)
    raise Vine::InvalidAccess.new(error.message)
  end

  def build_not_found_page(status=404, layout=false)
    @slug =  params[:slug].class == String ? params[:slug] : ''
    @slug =  (params[:id].class == String ? params[:id] : '') if @slug.blank?
    @slug.gsub!('-',' ')
    render_to_string status: status, layout: layout, formats: [:html], template: '/exceptions/not_found'
  end

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

  def store_preloaded_array(key, data, serializer, opts={})
    data = serialize_to_array(data, serializer, opts)
    store_preloaded(key, MultiJson.dump(data))
  end

  def serialize_to_array(obj, serializer, opts={})
    # If it's an array, apply the serializer as an each_serializer to the elements
    if !obj.is_a?(Array) && !obj.is_a?(ActiveRecord::Associations::CollectionProxy)
      obj = [obj]
    end

    opts[:each_serializer] = serializer
    ActiveModel::ArraySerializer.new(obj, opts).as_json
  end

  def preload_json
    return if request.xhr?

    preload_anonymous_data
    
    if current_user
      preload_current_user_data
    end
  end

  def fetch_user_from_params
    username_lower = params[:username].downcase
    username_lower.gsub!(/\.json$/, '')

    user = User.where("username_lower = ? OR id = ?", username_lower, username_lower.to_i).first
    raise Vine::NotFound.new if user.blank?

    user
  end

  def mini_profiler_enabled?
    defined?(Rack::MiniProfiler) && current_user.try(:admin?)
  end

  def authorize_mini_profiler
    return unless mini_profiler_enabled?
    Rack::MiniProfiler.authorize_request
  end

  def check_xhr
    # bypass xhr check on PUT / POST / DELETE provided api key is there, otherwise calling api is annoying
    return if !request.get? && api_key_valid?
    raise RenderEmpty.new unless ((request.format && request.format.json?) || request.xhr?)
  end

  private

  def preload_anonymous_data
    store_preloaded("settings", SiteSetting.client_settings_json)
  end

  def preload_current_user_data
    store_preloaded("currentUser", MultiJson.dump(CurrentUserSerializer.new(current_user, root: 'user')))

    draft = Draft.get(current_user)
    store_preloaded("draft", MultiJson.dump(DraftSerializer.new(draft))) if draft
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
