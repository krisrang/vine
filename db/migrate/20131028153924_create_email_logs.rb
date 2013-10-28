class CreateEmailLogs < ActiveRecord::Migration
  def change
    create_table :email_logs do |t|
      t.string  :to_address, null: false
      t.string  :email_type, null: false
      t.integer :user_id

      t.timestamps

      t.index :created_at
      t.index [:created_at, :user_id]
    end

    add_column :users, :last_emailed_at, :datetime
  end
end
