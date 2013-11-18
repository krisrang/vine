require_dependency 'pretty_text'

class Message < ActiveRecord::Base
  belongs_to :user

  scope :latest, -> { order('created_at DESC').limit(10) }

  before_save do
    # self.last_editor_id ||= user_id
    self.cooked = PrettyText.cook(source) if self.source_changed?
  end
end