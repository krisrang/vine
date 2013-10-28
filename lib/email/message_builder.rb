module Email
  module BuildEmailHelper
    def build_email(*builder_args)
      builder = Email::MessageBuilder.new(*builder_args)
      headers(builder.header_args) if builder.header_args.present?
      mail(builder.build_args)
    end
  end

  class MessageBuilder
    attr_reader :template_args

    def initialize(to, opts=nil)
      @to = to
      @opts = opts || {}

      @template_args = {site_name: SiteSetting.title, base_url: Vine.base_url}

      # if @template_args[:url].present?
      #   @template_args[:respond_instructions] =
      #     if allow_reply_by_email?
      #       I18n.t('user_notifications.reply_by_email', @template_args)
      #     else
      #       I18n.t('user_notifications.visit_link_to_respond', @template_args)
      #     end
      # end
    end

    def subject
      subject = @opts[:subject]
      subject = I18n.t("#{@opts[:template]}.subject", template_args) if @opts[:template]
      subject
    end

    def build_args
      { to: @to,
        subject: subject,
        charset: 'UTF-8',
        from: from_value }
    end

    def header_args
      result = {}
      result['Reply-To'] = allow_reply_by_email? ? reply_by_email_address : from_value

      result.merge(MessageBuilder.custom_headers(SiteSetting.email_custom_headers))
    end

    def self.custom_headers(string)
      result = {}
      string.split('|').each { |item|
        header = item.split(':', 2)
        if header.length == 2
          name = header[0].strip
          value = header[1].strip
          result[name] = value if name.length > 0 && value.length > 0
        end
      } unless string.nil?
      result
    end

    protected

    def allow_reply_by_email?
      SiteSetting.reply_by_email_enabled? &&
      reply_by_email_address.present? &&
      @opts[:allow_reply_by_email]
    end

    def from_value
      return @from_value if @from_value
      @from_value = @opts[:from] || SiteSetting.notification_email
      @from_value = alias_email(@from_value)
      @from_value
    end

    def reply_by_email_address
      return @reply_by_email_address if @reply_by_email_address
      return nil unless SiteSetting.reply_by_email_address.present?

      @reply_by_email_address = SiteSetting.reply_by_email_address.dup
      @reply_by_email_address.gsub!("%{reply_key}", reply_key)
      @reply_by_email_address = alias_email(@reply_by_email_address)

      @reply_by_email_address
    end

    def alias_email(source)
      return source if @opts[:from_alias].blank?
      "#{@opts[:from_alias]} <#{source}>"
    end
  end
end
