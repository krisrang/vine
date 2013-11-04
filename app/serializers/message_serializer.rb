class MessageSerializer < ActiveModel::Serializer
  attributes :id, :user_id, :source, :cooked
end
