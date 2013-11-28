var attr = DS.attr;

Vine.User = DS.Model.extend({
  username: attr(),
  usernameLower: attr(),
  email: attr(),
  password: attr(),
  createdAt: attr('date'),
  lastSeenAt: attr('date'),
  admin: attr('boolean'),
  active: attr('boolean'),
  avatars: attr(),

  // Fake attributes for hp handling on create
  password_confirmation: attr(),
  challenge: attr(),
  message: attr(),

  messages: DS.hasMany('message'),
  drafts: DS.hasMany('draft'),

  thumbAvatar: function() {
    var avatars = this.get('avatars');
    if (avatars && avatars.thumb) {
      return avatars.thumb;
    }

    return "";
  }.property('avatars')
});

Vine.User.reopenClass({
  checkUsername: function(username, email) {
    return Vine.ajax('/users/check_username', {
      data: { username: username, email: email }
    });
  }
});