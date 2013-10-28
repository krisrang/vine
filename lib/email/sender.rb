# A helper class to send an email. It will also handle a nil message, which it considers
# to be "do nothing". This is because some Mailers will decide not to do work for some
# reason. For example, emailing a user too frequently. A nil to address is also considered
# "do nothing"
#
# It also adds an HTML part for the plain text body
#

module Email
  class Sender

    def initialize(message, email_type, user=nil)
      @message =  message
      @email_type = email_type
      @user = user
    end

    def send
      return if @message.blank?
      return if @message.to.blank?
      return if @message.body.blank?

      @message.charset = 'UTF-8'

      # Set up the email log
      to_address = @message.to
      to_address = to_address.first if to_address.is_a?(Array)
      email_log = EmailLog.new(email_type: @email_type,
                               to_address: to_address,
                               user_id: @user.try(:id))

      @message.deliver

      # Save and return the email log
      email_log.save!
      email_log

    end
  end
end