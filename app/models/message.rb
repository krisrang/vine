require_dependency 'pretty_text'

class Message < ActiveRecord::Base
  belongs_to :user

  scope :latest, -> { order('created_at DESC').limit(10) }
end