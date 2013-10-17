class CreateUsers < ActiveRecord::Migration
  def change
    create_table :users do |t|
      t.string  :username,        limit: 20,      null: false
      t.string  :username_lower,  limit: 20,      null: false
      t.string  :email,           null: false
      t.string  :password_hash,   limit: 64
      t.string  :salt,            limit: 32
      t.string  :auth_token,      limit: 32
      t.string :ip_address

      t.datetime :last_seen_at
      t.datetime :previous_visit_at

      t.boolean :admin,           default: false, null: false

      t.timestamps

      t.index :auth_token
      t.index :email, unique: true
      t.index :username, unique: true
      t.index :username_lower, unique: true
    end
  end
end