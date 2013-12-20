class ApplicationAuthorizer < Authority::Authorizer
  def self.default(adjective, user)
    if adjective == :creatable || adjective == :readable
      return true
    end

    user.admin?
  end
end
