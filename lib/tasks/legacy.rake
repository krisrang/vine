require 'net/http'

desc "Import data from legacy KrisBB"
task import: :environment do
  token = ENV['TOKEN']
  next if token.nil?

  User.destroy_all
  Message.destroy_all

  users = http_req(token, "http://forum.kristjanrang.eu/users.json")
  next if users.nil?

  map = {}

  puts "Importing Users"
  users.each do |user|
    u = User.new(admin: user["admin"] === true, username: user["username"], email: (user["email"].blank? ? "fake@email.com" : user["email"]))
    u.remote_avatar_url = user["avatar"]["url"]
    u.save!
    map[user["_id"]] = u.id
  end

  messages = http_req(token, "http://forum.kristjanrang.eu/messages.json")
  next if messages.nil?

  puts "Importing messages"
  messages.each do |message|
    m = Message.new(source: message["text"], created_at: DateTime.parse(message["created_at"]), updated_at: DateTime.parse(message["updated_at"]))
    m.user_id = map[message["user_id"]]
    m.save!
  end
end

def http_req(token, url)
  url = URI.parse(url)

  req = Net::HTTP::Get.new(url.path)
  req.add_field("Authorization", "Token token=\"#{token}\", nonce=\"def\"")
  res = Net::HTTP.new(url.host, url.port).start { |http| http.request(req) }

  resp = JSON.load(res.body)
  resp.is_a?(Array) ? resp : nil
end