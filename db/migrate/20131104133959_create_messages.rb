class CreateMessages < ActiveRecord::Migration
  def change
    create_table :messages do |t|
      t.integer :user_id
      t.text :source, null: false
      t.text :cooked

      t.timestamps
    end
  end
end
