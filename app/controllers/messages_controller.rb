class MessagesController < ApplicationController
  # App root, load latest messages
  def index
    messages = Message.latest
    serializer = ArraySerializer.new(messages)
    respond_to do |format|
      format.html do
        store_preloaded("messages_latest", MultiJson.dump(serializer))
      end

      format.json do
        render_json_dump(serializer)
      end
    end
  end
end
