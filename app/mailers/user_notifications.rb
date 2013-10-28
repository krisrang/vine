require_dependency 'email/message_builder'

class UserNotifications < ActionMailer::Base
  include Email::BuildEmailHelper

  def signup(user, opts={})
    build_vars(opts)
    build_email(user.email, template: 'user_notifications.signup')
  end

  def signup_after_approval(user, opts={})
    build_vars(opts)
    build_email(user.email, template: 'user_notifications.signup_after_approval')
  end

  def authorize_email(user, opts={})
    build_vars(opts)
    build_email(user.email, template: "user_notifications.authorize_email")
  end

  def forgot_password(user, opts={})
    build_vars(opts)
    build_email(user.email, template: "user_notifications.forgot_password")
  end

  private

  def build_vars(opts={})
    @site_name = SiteSetting.title
    @base_url = Vine.base_url

    @email_token = opts[:email_token] if opts[:email_token]
  end
end
