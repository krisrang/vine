class UserSerializer < ApplicationSerializer

  attributes :id, 
             :username,
             :email,
             :last_seen_at,
             :created_at,
             :admin,
             :message,
             :active

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
