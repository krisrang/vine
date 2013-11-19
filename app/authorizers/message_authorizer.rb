class MessageAuthorizer < ApplicationAuthorizer
  def updatable_by?(user)
    user.present? && (user.admin? || resource.user == user)
  end

  def deletable_by?(user)
    user.present? && (user.admin? || resource.user == user)
  end
end
