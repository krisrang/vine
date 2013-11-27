namespace :messages do
  desc "Re-cook all messages"
  task cook: :environment do
    Message.find_each do |msg|
      puts "#{msg.id} queued" if msg.update_attributes(updated_at: DateTime.now)
    end
  end
end