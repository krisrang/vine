class Draft < ActiveRecord::Base
  include Authority::Abilities
  self.authorizer_name = 'DraftAuthorizer'
  
  belongs_to :user
  belongs_to :message

  def self.get(user)
    Draft.where(user_id: user.id).first
  end

  def self.set(user, draft)
    d = self.get(user)
    data = {action: draft[:action], reply: draft[:reply]}
    data.merge(message_id: draft[:message_id]) if !draft[:message_id].blank?
    
    d ? d.update_columns(data) : Draft.create(data.merge(user_id: user.id))
  end

  def self.clear(user)
    user.drafts.destroy_all
  end
end