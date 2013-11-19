class DraftAuthorizer < ApplicationAuthorizer
  def self.deletable_by?(user)
    user.present?
  end
end
