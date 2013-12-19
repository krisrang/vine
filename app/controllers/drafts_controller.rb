class DraftsController < ApplicationController
  before_filter :ensure_logged_in
  skip_before_filter :check_xhr

  def index
    @draft = Draft.get(current_user)
    authorize @draft

    respond_to do |format|
      format.json do
        render json: @draft
      end
    end
  end

  def create
    @draft = Draft.set(current_user, params[:draft])
    authorize @draft
    render json: @draft
  end

  def destroy
    authorize nil
    Draft.clear(current_user)
    render json: success_json
  end
end
