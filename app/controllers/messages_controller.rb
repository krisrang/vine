class MessagesController < ApplicationController
  # App root, load latest messages
  def index
    @messages = Message.latest

    respond_to do |format|
      format.html do
        store_preloaded_json("messages_latest", @messages)
      end

      format.json do
        render json: @messages
      end
    end
  end
end
