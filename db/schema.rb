# encoding: UTF-8
# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 20131126130511) do

  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "drafts", force: true do |t|
    t.integer  "user_id",    null: false
    t.string   "action",     null: false
    t.text     "reply",      null: false
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer  "message_id"
  end

  add_index "drafts", ["user_id"], name: "index_drafts_on_user_id", using: :btree

  create_table "email_logs", force: true do |t|
    t.string   "to_address", null: false
    t.string   "email_type", null: false
    t.integer  "user_id"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "email_logs", ["created_at", "user_id"], name: "index_email_logs_on_created_at_and_user_id", using: :btree
  add_index "email_logs", ["created_at"], name: "index_email_logs_on_created_at", using: :btree

  create_table "email_tokens", force: true do |t|
    t.integer  "user_id",                    null: false
    t.string   "email",                      null: false
    t.string   "token",                      null: false
    t.boolean  "confirmed",  default: false, null: false
    t.boolean  "expired",    default: false, null: false
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "email_tokens", ["token"], name: "index_email_tokens_on_token", unique: true, using: :btree

  create_table "messages", force: true do |t|
    t.integer  "user_id"
    t.text     "source",     null: false
    t.text     "cooked"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "messages_uploads", id: false, force: true do |t|
    t.integer "message_id", null: false
    t.integer "upload_id",  null: false
  end

  add_index "messages_uploads", ["message_id"], name: "index_messages_uploads_on_message_id", using: :btree
  add_index "messages_uploads", ["upload_id"], name: "index_messages_uploads_on_upload_id", using: :btree

  create_table "site_settings", force: true do |t|
    t.string   "name",       null: false
    t.integer  "data_type",  null: false
    t.text     "value"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "site_settings", ["name"], name: "index_site_settings_on_name", using: :btree

  create_table "uploads", force: true do |t|
    t.integer  "user_id",           null: false
    t.string   "file",              null: false
    t.string   "sha",               null: false
    t.string   "content_type",      null: false
    t.string   "original_filename", null: false
    t.string   "size",              null: false
    t.string   "width"
    t.string   "height"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer  "client_width"
    t.integer  "client_height"
  end

  add_index "uploads", ["user_id"], name: "index_uploads_on_user_id", using: :btree

  create_table "user_open_ids", force: true do |t|
    t.integer  "user_id",    null: false
    t.string   "email",      null: false
    t.string   "url",        null: false
    t.boolean  "active",     null: false
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "user_open_ids", ["url"], name: "index_user_open_ids_on_url", using: :btree

  create_table "user_stats", force: true do |t|
    t.integer "user_id",                  null: false
    t.integer "days_visited", default: 0, null: false
  end

  create_table "user_visits", force: true do |t|
    t.integer "user_id",    null: false
    t.date    "visited_at", null: false
  end

  add_index "user_visits", ["user_id", "visited_at"], name: "index_user_visits_on_user_id_and_visited_at", unique: true, using: :btree

  create_table "users", force: true do |t|
    t.string   "username",            limit: 20,                 null: false
    t.string   "username_lower",      limit: 20,                 null: false
    t.string   "email",                                          null: false
    t.string   "password_hash",       limit: 64
    t.string   "salt",                limit: 32
    t.string   "auth_token",          limit: 32
    t.string   "ip_address"
    t.datetime "last_seen_at"
    t.datetime "previous_visit_at"
    t.boolean  "admin",                          default: false, null: false
    t.datetime "created_at"
    t.datetime "updated_at"
    t.datetime "banned_at"
    t.datetime "banned_till"
    t.boolean  "active"
    t.boolean  "approved",                       default: false, null: false
    t.integer  "approved_by_id"
    t.datetime "approved_at"
    t.datetime "last_emailed_at"
    t.string   "avatar"
    t.string   "avatar_secure_token"
  end

  add_index "users", ["auth_token"], name: "index_users_on_auth_token", using: :btree
  add_index "users", ["email"], name: "index_users_on_email", unique: true, using: :btree
  add_index "users", ["username"], name: "index_users_on_username", unique: true, using: :btree
  add_index "users", ["username_lower"], name: "index_users_on_username_lower", unique: true, using: :btree

end
