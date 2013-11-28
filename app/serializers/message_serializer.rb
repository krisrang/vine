class MessageSerializer < ApplicationSerializer
  embed :ids, include: true

  attributes :id, :user_id, :source, :cooked, :created_at, :updated_at

  has_one :user
end
