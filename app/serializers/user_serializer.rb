class UserSerializer < BasicUserSerializer

  attributes :email,
             :last_seen_at,
             :created_at,
             :admin

  # def self.private_attributes(*attrs)
  #   attributes *attrs
  #   attrs.each do |attr|
  #     define_method "include_#{attr}?" do
  #       can_edit
  #     end
  #   end
  # end

  # private_attributes :email
end
