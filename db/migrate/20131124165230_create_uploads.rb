class CreateUploads < ActiveRecord::Migration
  def change
    create_table :uploads do |t|
      t.integer :user_id,           null: false
      t.string  :file,              null: false
      t.string  :sha,               null: false
      t.string  :content_type,      null: false
      t.string  :original_filename, null: false
      t.string  :size,              null: false
      t.integer  :width
      t.integer  :height

      t.timestamps

      t.index :user_id
    end

    create_join_table :messages, :uploads do |t|
      t.index :message_id
      t.index :upload_id
    end
  end
end
