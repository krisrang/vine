class MessagesController < ApplicationController
  before_filter :ensure_logged_in, except: [:index, :show]
  skip_before_filter :check_xhr, only: [:index]

  # App root, load latest messages
  def index
    @messages = Message.includes(:user).latest.to_a
    authorize @messages

    respond_to do |format|
      format.html do
        store_preloaded_array("messages_latest", @messages, MessageSerializer)
      end

      format.json do
        render json: @messages
      end
    end
  end

  def show
    @message = Message.find(params[:id])
    authorize @message
    render json: @message
  end

  def create
    @message = Message.create(message_params)
    authorize @message
    render json: @message
  end

  def update
    @message = Message.find(params[:id])
    authorize @message
    @message.update_attributes!(message_params)
    render json: @message
  end

  def destroy
    @message = Message.find(params[:id])
    authorize @message
    @message.destroy
    render json: @message
  end

  private

  def message_params
    params.require(:message)
      .permit(:cooked, :created_at, :updated_at, :user_id, :source, :image_sizes)
      .except(:cooked, :created_at, :updated_at, :user_id) # filter Ember Data crap
      .merge(user: current_user)
  end
end
