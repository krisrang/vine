class DraftSerializer < ApplicationSerializer
  attributes :id, :user_id, :reply, :action, :created_at, :updated_at
end
