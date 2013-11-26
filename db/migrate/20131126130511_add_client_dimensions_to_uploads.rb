class AddClientDimensionsToUploads < ActiveRecord::Migration
  def change
    add_column :uploads, :client_width, :integer
    add_column :uploads, :client_height, :integer
  end
end
