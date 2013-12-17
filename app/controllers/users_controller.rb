require_dependency 'user_name_suggester'
require_dependency 'user_activator'

class UsersController < ApplicationController

  skip_before_filter :check_xhr, only: [:show, :password_reset, :update, :activate_account, :authorize_email]

  before_filter :ensure_logged_in, only: [:index, :show, :username, :update, :change_email]

  # we need to allow account creation with bad CSRF tokens, if people are caching, the CSRF token on the
  #  page is going to be empty, this means that server will see an invalid CSRF and blow the session
  #  once that happens you can't log in with social
  skip_before_filter :verify_authenticity_token, only: [:create]
  skip_before_filter :redirect_to_login_if_required, only: [:check_username,
                                                            :create,
                                                            :get_honeypot_value,
                                                            :activate_account,
                                                            :authorize_email,
                                                            :password_reset,
                                                            :send_activation_email]

  # Used for checking availability of a username and will return suggestions
  # if the username is not available.
  def check_username
    params.require(:username)
    username = params[:username]

    target_user = user_from_params_or_current_user

    # The special case where someone is changing the case of their own username
    return render_available_true if changing_case_of_own_username(target_user, username)

    checker = UsernameChecker.new
    email = params[:email] || target_user.try(:email)
    render(json: checker.check_username(username, email))
  end

  def create
    return fake_success_response if suspicious? params

    user = User.new_from_params(params)
    auth = authenticate_user(user, params)

    if user.save
      activator = UserActivator.new(user, request, session, cookies)
      user.message = activator.activation_message
      create_third_party_auth_records(user, auth)

      # Clear authentication session.
      session[:authentication] = nil

      render json: user
    else
      render json: user, meta: user.errors_hash, meta_key: 'errors', status: 422
    end
  end

  def get_honeypot_value
    render json: {value: honeypot_value, challenge: challenge_value}
  end

  def password_reset
    expires_now()

    @user = EmailToken.confirm(params[:token])
    if @user.blank?
      flash[:error] = I18n.t('password_reset.no_token')
    else
      if request.put? && params[:password].present?
        @user.password = params[:password]
        if @user.save

          if @user.approved?
            # Log in the user
            log_on_user(@user)
            flash[:success] = I18n.t('password_reset.success')
          else
            @requires_approval = true
            flash[:success] = I18n.t('password_reset.success_unapproved')
          end
        end
      end
    end
    render layout: 'no_js'
  end

  def authorize_email
    expires_now()
    if @user = EmailToken.confirm(params[:token])
      log_on_user(@user)
    else
      flash[:error] = I18n.t('change_email.error')
    end
    render layout: 'no_js'
  end

  def activate_account
    expires_now()
    if @user = EmailToken.confirm(params[:token])

      # Log in the user unless they need to be approved
      if @user.approved?
        log_on_user(@user)
      else
        @needs_approval = true
      end

    else
      flash[:error] = I18n.t('activation.already_done')
    end
    render layout: 'no_js'
  end

  def send_activation_email
    @user = fetch_user_from_params
    @email_token = @user.email_tokens.unconfirmed.active.first
    if @user
      @email_token ||= @user.email_tokens.create(email: @user.email)
      UserEmail.perform_async({type: :signup, user_id: @user.id, email_token: @email_token.token})
    end
    render nothing: true
  end

  def show
    @user = fetch_user_from_params
    authorize_action_for @user

    respond_to do |format|
      format.html do
        store_preloaded_array("users", @user, UserSerializer, root: "users")
      end

      format.json do
        render json: @user
      end
    end
  end

  def index
    @users = User.where(username_lower: params[:username].downcase)
    authorize_action_for @users
    render json: @users
  end

  def preferences
    render nothing: true
  end


  private

  def user_from_params_or_current_user
    params[:for_user_id] ? User.find(params[:for_user_id]) : current_user
  end

  def authenticate_user(user, params)
    auth = session[:authentication]
    if valid_session_authentication?(auth, params[:email])
      user.active = true
    end
    user.password_required! unless auth

    auth
  end

  def render_available_true
    render(json: { available: true })
  end

  def changing_case_of_own_username(target_user, username)
    target_user and username.downcase == target_user.username.downcase
  end

  def honeypot_value
    Digest::SHA1::hexdigest("#{Vine.current_hostname}:#{Vine::Application.config.secret_token}")[0,15]
  end

  def challenge_value
    challenge = $redis.get('SECRET_CHALLENGE')
    unless challenge && challenge.length == 16*2
      challenge = SecureRandom.hex(16)
      $redis.set('SECRET_CHALLENGE',challenge)
    end

    challenge
  end

  def suspicious?(params)
    honeypot_or_challenge_fails?(params)
  end

  def fake_success_response
    user = User.new(active: false, message: I18n.t("login.activate_email", email: params[:email]))
    render json: user
  end

  def honeypot_or_challenge_fails?(params)
    params[:password_confirmation] != honeypot_value ||
    params[:challenge] != challenge_value.try(:reverse)
  end

  def valid_session_authentication?(auth, email)
    auth && auth[:email] == email && auth[:email_valid]
  end

  def create_third_party_auth_records(user, auth)
    return unless auth && auth[:authenticator_name]

    authenticator = Users::OmniauthCallbacksController.find_authenticator(auth[:authenticator_name])
    authenticator.after_create_account(user, auth)
  end
end
