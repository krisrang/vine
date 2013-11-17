class MessagesController < ApplicationController
  before_filter :ensure_logged_in, except: [:index, :show]

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

  def show
    message = Message.find(params[:id])
    render json: message
  end

  def create
    message = Message.create(message_params)
    render json: message
  end

  def update
    message = Message.find(params[:id])
    message.update_attributes!(message_params)
    render json: message
  end

  private

  def message_params
    params.require(:message)
      .permit(:cooked, :created_at, :updated_at, :user_id, :source)
      .except(:cooked, :created_at, :updated_at, :user_id) # filter Ember Data crap
      .merge(user: current_user)
  end
end
