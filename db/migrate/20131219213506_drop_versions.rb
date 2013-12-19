class DropVersions < ActiveRecord::Migration
  def up
    drop_table :versions
  end

  def down
    create_table :versions
    add_index :versions, [:item_type, :item_id]
  end
end
