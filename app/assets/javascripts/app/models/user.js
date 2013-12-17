// var attr = DS.attr;

Vine.User = Vine.Model.extend({
  // username: attr(),
  // usernameLower: attr(),
  // email: attr(),
  // password: attr(),
  // createdAt: attr('date'),
  // lastSeenAt: attr('date'),
  // lastMessageAt: attr('date'),
  // admin: attr('boolean'),
  // active: attr('boolean'),
  // avatars: attr(),

  // Fake attributes for hp handling on create
  // password_confirmation: attr(),
  // challenge: attr(),
  // message: attr(),

  // messages: DS.hasMany('message'),
  // drafts: DS.hasMany('draft'),

  findDetails: function() {
    var user = this;

    return PreloadStore.getAndRemove("user_" + user.get('username'), function() {
      return Vine.ajax("/users/" + user.get('username') + '.json');
    }).then(function (json) {
      user.setProperties(json.user);
      return user;
    });
  },

  avatar: function() {
    var avatars = this.get('avatars');
    if (avatars && avatars.full) { return avatars.full; }

    return "";
  }.property('avatars'),

  profileAvatar: function() {
    var avatars = this.get('avatars');
    if (avatars && avatars.profile) { return avatars.profile; }
    if (avatars && avatars.full) { return avatars.full; }

    return "";
  }.property('avatars'),

  thumbAvatar: function() {
    var avatars = this.get('avatars');
    if (avatars && avatars.thumb) { return avatars.thumb; }
    if (avatars && avatars.full) { return avatars.full; }

    return "";
  }.property('avatars')
});

Vine.User.reopenClass({
  checkUsername: function(username, email) {
    return Vine.ajax('/users/check_username', {
      data: { username: username, email: email }
    });
  },

  createAccount: function(email, password, username, passwordConfirm, challenge) {
    return Vine.ajax("/users", {
      data: {
        email: email,
        password: password,
        username: username,
        password_confirmation: passwordConfirm,
        challenge: challenge
      },
      type: 'POST'
    });
  }
});