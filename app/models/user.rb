require_dependency 'pbkdf2'

class User < ActiveRecord::Base
  has_many :user_visits, dependent: :destroy
  has_one :user_stat, dependent: :destroy

  validates_presence_of :username
  validate :username_validator
  validates :email, presence: true, uniqueness: true
  validates :email, email: true, if: :email_changed?
  validate :password_validator

  before_save :update_username_lower
  before_save :ensure_password_is_hashed

  after_create :create_user_stat

  def self.username_length
    3..15
  end

  def self.username_available?(username)
    lower = username.downcase
    User.where(username_lower: lower).blank?
  end

  def self.new_from_params(params)
    user = User.new
    user.name = params[:name]
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

  def admin?
    admin
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
end
