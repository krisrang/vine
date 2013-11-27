require_dependency 'pretty_text'

require 'digest/sha1'

class Message < ActiveRecord::Base
  include Authority::Abilities
  self.authorizer_name = 'MessageAuthorizer'

  belongs_to :user
  has_and_belongs_to_many :uploads

  scope :latest, -> { order('created_at DESC').limit(10) }

  attr_accessor :image_sizes, :invalidate_oneboxes

  before_save do
    # self.last_editor_id ||= user_id
    self.cooked = cook(source, {}) if self.source_changed?
  end

  after_save :trigger_post_process

  def raw_hash
    return if source.blank?
    Digest::SHA1.hexdigest(source.gsub(/\s+/, ""))
  end

  def self.white_listed_image_classes
    @white_listed_image_classes ||= ['avatar', 'favicon', 'thumbnail']
  end

  def message_analyzer
    @message_analyzers ||= {}
    @message_analyzers[raw_hash] ||= MessageAnalyzer.new(source)
  end

  def cook(*args)
    message_analyzer.cook(*args)
  end

  def self.white_listed_image_classes
    @white_listed_image_classes ||= ['avatar', 'favicon', 'thumbnail']
  end

  private

  def trigger_post_process
    args = { message_id: id }
    args[:image_sizes] = image_sizes if image_sizes.present?
    args[:invalidate_oneboxes] = true if invalidate_oneboxes.present?
    MessageProcess.perform_async(args)
  end
end