class ApplicationSerializer < ActiveModel::Serializer
  root false
  embed :ids#, include: true
end
