namespace :messages do
  desc "Re-cook all messages"
  task cook: :environment do
    Message.find_each do |msg|
      puts "#{msg.id} cooked" if msg.update_attributes(cooked: PrettyText.cook(msg.source))
    end
  end
end