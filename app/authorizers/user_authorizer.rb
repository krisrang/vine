class UserAuthorizer < ApplicationAuthorizer
  def self.creatable_by?(user)
    user.manager?
  end

  def updatable_by?(user)
    if resource.email_changed?
      return true if is_admin?
      return false unless SiteSetting.email_editable?
    end

    ApplicationAuthorizer.updatable_by?(user)
  end

  def deletable_by?(user)
    user.present &&
    (user.admin? || resource.try(:user) == user) &&
    !resource.admin?
  end

  def impersonatable_by?(user)
    user.admin? && (!resource.admin? || user.developer?)
  end

  def approvable_by?(user)
    user.admin? && (!resource.admin? || user.developer?)
  end

  def bannable_by?(user)
    user.admin? && (!resource.admin? || user.developer?)
  end

  # def admin_grantable_by?(user)
  # end
end