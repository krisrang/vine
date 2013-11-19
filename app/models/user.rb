require_dependency 'pbkdf2'
require_dependency 'email'
require_dependency 'vine'

class User < ActiveRecord::Base
  include Authority::UserAbilities

  include Authority::Abilities
  self.authorizer_name = 'UserAuthorizer'
  
  mount_uploader :avatar, AvatarUploader
  
  has_many :user_visits, dependent: :destroy
  has_one :user_stat, dependent: :destroy
  has_many :email_tokens, dependent: :destroy
  belongs_to :approved_by, class_name: 'User'
  has_many :user_open_ids, dependent: :destroy
  has_many :email_logs, dependent: :destroy
  has_many :messages, dependent: :destroy
  has_many :drafts, dependent: :destroy

  validates_presence_of :username
  validate :username_validator
  validates :email, presence: true, uniqueness: true
  validates :email, email: true, if: :email_changed?
  validate :password_validator

  before_save :update_username_lower
  before_save :ensure_password_is_hashed

  after_create :create_email_token
  after_create :create_user_stat

  attr_accessor :message

  scope :banned,      -> { where('banned_till IS NOT NULL AND banned_till > ?', Time.zone.now) }
  scope :not_banned,  -> { where('banned_till IS NULL') }

  EMAIL = %r{([^@]+)@([^\.]+)}

  def self.username_length
    3..15
  end

  def self.username_available?(username)
    lower = username.downcase
    User.where(username_lower: lower).blank?
  end

  def self.new_from_params(params)
    user = User.new
    user.email = params[:email]
    user.password = params[:password]
    user.username = params[:username]
    user
  end

  def self.find_by_username_or_email(username_or_email)
    conditions = if username_or_email.include?('@')
      { email: Email.downcase(username_or_email) }
    else
      { username_lower: username_or_email.downcase }
    end

    users = User.where(conditions).to_a

    if users.size > 1
      raise Vine::TooManyMatches
    else
      users.first
    end
  end

  def approve(approved_by, send_mail=true)
    self.approved = true

    if Fixnum === approved_by
      self.approved_by_id = approved_by
    else
      self.approved_by = approved_by
    end

    self.approved_at = Time.now

    send_approval_email if save and send_mail
  end

  def admin?
    admin
  end

  def developer?
    admin? &&
    (Rails.env.development? ||
      (
        Rails.configuration.respond_to?(:developer_emails) &&
        Rails.configuration.developer_emails.include?(email)
      )
    )
  end

  def is_banned?
    banned_till && banned_till > DateTime.now
  end

  def update_username_lower
    self.username_lower = username.downcase
  end

  def password=(password)
    # special case for passwordless accounts
    @raw_password = password unless password.blank?
  end

  # Indicate that this is NOT a passwordless account for the purposes of validation
  def password_required!
    @password_required = true
  end

  def confirm_password?(password)
    return false unless password_hash && salt
    self.password_hash == hash_password(password, salt)
  end

  def ensure_password_is_hashed
    if @raw_password
      self.salt = SecureRandom.hex(16)
      self.password_hash = hash_password(@raw_password, salt)
    end
  end

  def hash_password(password, salt)
    Pbkdf2.hash_password(password, salt, Rails.configuration.pbkdf2_iterations, Rails.configuration.pbkdf2_algorithm)
  end

  def username_validator
    username_format_validator || begin
      lower = username.downcase
      existing = User.where(username_lower: lower).first
      if username_changed? && existing && existing.id != self.id
        errors.add(:username, I18n.t(:'user.username.unique'))
      end
    end
  end

  def username_format_validator
    UsernameValidator.perform_validation(self, 'username')
  end

  def password_validator
    if (@raw_password && @raw_password.length < 6) || (@password_required && !@raw_password)
      errors.add(:password, "must be 6 letters or longer")
    end
  end

  def errors_hash
    { 
      message: I18n.t("login.errors", errors: self.errors.full_messages.join("\n")),
      values: self.attributes.slice("name", "username", "email")
    }
  end

  def email_confirmed?
    email_tokens.where(email: email, confirmed: true).present? || email_tokens.empty?
  end

  def approved?
    return true unless SiteSetting.must_approve_users?
    return true if self.admin?

    self.approved
  end

  def activate
    email_token = self.email_tokens.active.first
    if email_token
      EmailToken.confirm(email_token.token)
    else
      self.active = true
      save
    end
  end

  def deactivate
    self.active = false
    save
  end

  def seen_before?
    last_seen_at.present?
  end

  def has_visit_record?(date)
    user_visits.where(visited_at: date).first
  end

  def update_visit_record!(date)
    unless has_visit_record?(date)
      user_stat.update_column(:days_visited, user_stat.days_visited + 1)
      user_visits.create!(visited_at: date)
    end
  end

  def update_ip_address!(new_ip_address)
    unless ip_address == new_ip_address || new_ip_address.blank?
      update_column(:ip_address, new_ip_address)
    end
  end

  def update_last_seen!(now=nil)
    now ||= Time.zone.now
    now_date = now.to_date

    # Only update last seen once every minute
    redis_key = "user:#{self.id}:#{now_date}"
    if $redis.setnx(redis_key, "1")
      $redis.expire(redis_key, SiteSetting.active_user_rate_limit_secs)

      update_visit_record!(now_date)

      # Keep track of our last visit
      if seen_before? && (self.last_seen_at < (now - SiteSetting.previous_visit_timeout_hours.hours))
        previous_visit_at = last_seen_at
        update_column(:previous_visit_at, previous_visit_at)
      end
      update_column(:last_seen_at, now)
    end
  end

  def create_user_stat
    stat = UserStat.new
    stat.user_id = id
    stat.save!
  end

  def create_email_token
    email_tokens.create(email: email)
  end

  def send_approval_email
    UserEmail.perform_async({type: :signup_after_approval, user_id: id, email_token: email_tokens.first.token})
  end
end
