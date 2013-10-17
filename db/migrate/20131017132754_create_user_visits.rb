class CreateUserVisits < ActiveRecord::Migration
  def change
    create_table :user_visits do |t|
      t.integer :user_id, null: false
      t.date :visited_at, null: false

      t.index [:user_id, :visited_at], unique: true
    end
  end
end
