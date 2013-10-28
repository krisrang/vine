class CreateUserOpenIds < ActiveRecord::Migration
  def change
    create_table :user_open_ids do |t|
      t.integer :user_id, null: false
      t.string  :email,   null: false
      t.string  :url,     null: false
      t.boolean :active,  null: false

      t.timestamps

      t.index :url
    end
  end
end
