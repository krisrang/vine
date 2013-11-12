class MessageSerializer < ApplicationSerializer
  attributes :id, :user_id, :source, :cooked, :created_at, :updated_at
end
