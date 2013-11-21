require 'net/http'

desc "Import data from legacy KrisBB"
task import: :environment do
  token = ENV['KRISBB_TOKEN']
  next if token.nil?

  puts "Pruning"

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

  puts "Importing messages"
  page = 1

  while !page.nil? do
    puts "Page #{page}"

    messages = http_req(token, "http://forum.kristjanrang.eu/messages.json?page=#{page}")
    
    if messages.nil? || messages.length == 0
      page = nil
    else
      messages.each do |message|
        m = Message.new(source: message["text"], created_at: DateTime.parse(message["created_at"]), updated_at: DateTime.parse(message["updated_at"]))
        m.user_id = map[message["user_id"]]
        m.save!
      end

      page += 1
    end
  end
end

def http_req(token, url)
  url = URI.parse(url)

  req = Net::HTTP::Get.new(url)
  req.add_field("Authorization", "Token token=\"#{token}\", nonce=\"def\"")
  res = Net::HTTP.new(url.host, url.port).start { |http| http.request(req) }

  resp = JSON.load(res.body)
  resp.is_a?(Array) ? resp : nil
end