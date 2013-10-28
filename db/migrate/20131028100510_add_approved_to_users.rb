class AddApprovedToUsers < ActiveRecord::Migration
  def change
    add_column :users, :approved, :boolean, default: false, null: false
    add_column :users, :approved_by_id, :integer
    add_column :users, :approved_at, :datetime
  end
end
