UserPolicy = Struct.new(:user, :user_record) do
  def create?
    user.manager?
  end

  def update?
    if user_record.email_changed?
      return true if is_admin?
      return false unless SiteSetting.email_editable?
    end

    user.present?
  end

  def destroy?
    user.present? &&
    (user.admin? || user_record == user) &&
    !user_record.admin?
  end

  def impersonate?
    user.admin? && (!user_record.admin? || user.developer?)
  end

  def approve?
    user.admin? && (!user_record.admin? || user.developer?)
  end

  def ban?
    user.admin? && (!user_record.admin? || user.developer?)
  end
end