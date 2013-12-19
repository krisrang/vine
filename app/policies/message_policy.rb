MessagePolicy = Struct.new(:user, :message) do
  def update?
    user.present? && (user.admin? || message.user == user)
  end

  def destroy?
    user.present? && (user.admin? || message.user == user)
  end
end