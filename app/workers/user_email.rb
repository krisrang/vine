class UserEmail
  include Sidekiq::Worker

  def perform(args = {})
    # Required parameters
    raise Vine::InvalidParameters.new(:user_id) unless args['user_id'].present?
    raise Vine::InvalidParameters.new(:type) unless args['type'].present?

    # Find the user
    user = User.where(id: args['user_id']).first
    return if !user || user.is_banned?

    email_args = {}
    email_args[:email_token] = args['email_token'] if args['email_token'].present?

    # Make sure that mailer exists
    raise Vine::InvalidParameters.new(:type) unless UserNotifications.respond_to?(args['type'])

    message = UserNotifications.send(args['type'], user, email_args)
    # Update the to address if we have a custom one
    if args['to_address'].present?
      message.to = [args['to_address']]
    end

    message.deliver
  end
end
