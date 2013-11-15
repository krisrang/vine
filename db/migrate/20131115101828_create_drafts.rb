class CreateDrafts < ActiveRecord::Migration
  def change
    create_table :drafts do |t|
      t.integer :user_id, null: false
      t.string  :action, null: false
      t.text    :reply, null: false

      t.timestamps

      t.index :user_id
    end
  end
end