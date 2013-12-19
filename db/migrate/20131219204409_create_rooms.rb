class CreateRooms < ActiveRecord::Migration
  def change
    create_table :rooms do |t|
      t.string :name, null: false
    end

    add_column :messages, :room_id, :integer, null: false
    add_index :messages, :room_id
  end
end
