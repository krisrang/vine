class AddBannedToUsers < ActiveRecord::Migration
  def change
    add_column :users, :banned_at, :datetime
    add_column :users, :banned_till, :datetime
  end
end
