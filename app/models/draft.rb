class Draft < ActiveRecord::Base
  belongs_to :user
  belongs_to :message

  def self.get(user)
    Draft.where(user_id: user.id).first
  end

  def self.set(user, draft)
    d = self.get(user)
    if d
      d.update_columns(action: draft[:action], reply: draft[:reply])
    else
      Draft.create(user_id: user.id, action: draft[:action], reply: draft[:reply])
    end
  end

  def self.clear(user)
    user.drafts.destroy_all
  end
end