class CreateUserStats < ActiveRecord::Migration
  def change
    create_table :user_stats do |t|
      t.integer :user_id, null: false, primary: true
      t.integer :days_visited, default: 0, null: false
    end
  end
end
