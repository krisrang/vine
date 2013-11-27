require_dependency 'cooked_post_processor'

class MessageProcess
  include Sidekiq::Worker

  def perform(args = {})
    args = args.with_indifferent_access
    message = Message.where(id: args[:message_id]).first
    return unless message.present?

    if args[:cook].present?
      message.update_column(:cooked, message.cook(message.source))
    end

    cp = CookedPostProcessor.new(message, args)
    cp.post_process

    # If we changed the document, save it
    message.update_column(:cooked, cp.html) if cp.dirty?
  end
end
