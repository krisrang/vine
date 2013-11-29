class UserSerializer < ApplicationSerializer

  attributes :id, 
             :username,
             :username_lower,
             :email,
             :last_seen_at,
             :created_at,
             :last_message_at,
             :admin,
             :message,
             :active,
             :avatars

  def avatars
    { 
      thumb: object.avatar.thumb.url,
      profile: object.avatar.profile.url,
      full: object.avatar.url
    }
  end

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
