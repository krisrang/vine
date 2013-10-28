# The guardian is responsible for confirming access to various site resources and operations
class Guardian

  class AnonymousUser
    def blank?; true; end
    def admin?; false; end
    def approved?; false; end
    def email; nil; end
  end

  def initialize(user=nil)
    @user = user.presence || AnonymousUser.new
  end

  def user
    @user.presence
  end
  alias :current_user :user

  def anonymous?
    !authenticated?
  end

  def authenticated?
    @user.present?
  end

  def is_admin?
    @user.admin?
  end

  def is_developer?
    @user &&
    is_admin? &&
    (Rails.env.development? ||
      (
        Rails.configuration.respond_to?(:developer_emails) &&
        Rails.configuration.developer_emails.include?(@user.email)
      )
    )
  end

  # Can the user see the object?
  def can_see?(obj)
    if obj
      see_method = method_name_for :see, obj
      return (see_method ? send(see_method, obj) : true)
    end
  end

  # Can the user edit the obj
  def can_edit?(obj)
    can_do?(:edit, obj)
  end

  # Can we delete the object
  def can_delete?(obj)
    can_do?(:delete, obj)
  end

  def can_moderate?(obj)
    obj && is_admin?
  end

  def can_create?(klass, parent=nil)
    return false unless authenticated? && klass

    # If no parent is provided, we look for a can_i_create_klass?
    # custom method.
    #
    # If a parent is provided, we look for a method called
    # can_i_create_klass_on_parent?
    target = klass.name.underscore
    if parent.present?
      return false unless can_see?(parent)
      target << "_on_#{parent.class.name.underscore}"
    end
    create_method = :"can_create_#{target}?"

    return send(create_method, parent) if respond_to?(create_method)

    true
  end

  # Can we impersonate this user?
  def can_impersonate?(target)
    target &&

    # You must be an admin to impersonate
    is_admin? &&

    # You may not impersonate other admins unless you are a dev
    (!target.admin? || is_developer?)

    # Additionally, you may not impersonate yourself;
    # but the two tests for different admin statuses
    # make it impossible to be the same user.
  end

  # Can we approve it?
  def can_approve?(target)
    is_admin? && target && not(target.approved?)
  end
  alias :can_activate? :can_approve?

  def can_ban?(user)
    user && is_admin? && user.regular?
  end
  alias :can_deactivate? :can_ban?

  def can_revoke_admin?(admin)
    can_administer_user?(admin) && admin.admin?
  end

  def can_grant_admin?(user)
    can_administer_user?(user) && not(user.admin?)
  end

  def can_block_user?(user)
    user && is_admin? && not(user.staff?)
  end

  def can_unblock_user?(user)
    user && is_admin?
  end

  def can_delete_user?(user)
    user && is_admin? && !user.admin? # && user.created_at > SiteSetting.delete_user_max_age.to_i.days.ago
  end

  # Support sites that have to approve users
  def can_access_messages?
    return true unless SiteSetting.must_approve_users?
    return false unless @user

    # Staff can't lock themselves out of a site
    return true if is_admin?

    @user.approved?
  end

  # Support for ensure_{blah}! methods.
  def method_missing(method, *args, &block)
    if method.to_s =~ /^ensure_(.*)\!$/
      can_method = :"#{Regexp.last_match[1]}?"

      if respond_to?(can_method)
        raise Vine::InvalidAccess.new("#{can_method} failed") unless send(can_method, *args, &block)
        return
      end
    end

    super.method_missing(method, *args, &block)
  end

  # Make sure we can see the object. Will raise a NotFound if it's nil
  def ensure_can_see!(obj)
    raise Vine::InvalidAccess.new("Can't see #{obj}") unless can_see?(obj)
  end

  def can_edit_user?(user)
    is_me?(user) || is_admin?
  end

  # def can_edit_username?(user)
  #   return true if is_admin?
  #   return false if SiteSetting.username_change_period <= 0
  #   is_me?(user) && (user.post_count == 0 || user.created_at > SiteSetting.username_change_period.days.ago)
  # end

  def can_edit_email?(user)
    return true if is_admin?
    return false unless SiteSetting.email_editable?
    can_edit?(user)
  end

  private

  def is_my_own?(obj)
    unless anonymous?
      return obj.user_id == @user.id if obj.respond_to?(:user_id) && obj.user_id && @user.id
      return obj.user == @user if obj.respond_to?(:user)
    end

    false
  end

  def is_me?(other)
    other && authenticated? && User === other && @user == other
  end

  def is_not_me?(other)
    @user.blank? || !is_me?(other)
  end

  def can_administer?(obj)
    is_admin? && obj.present?
  end

  def can_administer_user?(other_user)
    can_administer?(other_user) && is_not_me?(other_user)
  end

  def method_name_for(action, obj)
    method_name = :"can_#{action}_#{obj.class.name.underscore}?"
    return method_name if respond_to?(method_name)
  end

  def can_do?(action, obj)
    if obj && authenticated?
      action_method = method_name_for action, obj
      return (action_method ? send(action_method, obj) : true)
    end
  end
end
