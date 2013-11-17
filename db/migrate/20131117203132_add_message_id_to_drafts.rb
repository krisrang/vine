class AddMessageIdToDrafts < ActiveRecord::Migration
  def change
    add_column :drafts, :message_id, :integer
  end
end
