DraftPolicy = Struct.new(:user, :draft) do
  def destroy?
    user.present?
  end
end