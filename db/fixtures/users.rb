User.seed do |u|
  u.id = -1
  u.username = "system"
  u.username_lower = "system"
  u.email = "no_email"
  u.password = SecureRandom.hex
  u.active = true
  u.admin = true
  u.approved = true
end
