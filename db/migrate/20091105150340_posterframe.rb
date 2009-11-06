class Posterframe < ActiveRecord::Migration
  def self.up
    add_column :assets, :posterframe_file_name, :string
  end

  def self.down
    remove_column :assets, :posterframe_file_name
  end
end
