class DraftsController < ApplicationController
  authorize_actions_for Draft
  before_filter :ensure_logged_in

  def index
    @draft = Draft.get(current_user)

    respond_to do |format|
      format.json do
        render json: @draft
      end
    end
  end

  def create
    draft = Draft.set(current_user, params[:draft])
    render json: draft
  end

  def destroy
    Draft.clear(current_user)
    render json: success_json
  end
end
