var attr = DS.attr;

Vine.User = DS.Model.extend({
  username: attr(),
  email: attr(),
  password: attr(),
  createdAt: attr('date'),
  lastSeenAt: attr('date'),
  admin: attr('boolean'),
  active: attr('boolean'),

  // Fake attributes for hp handling on create
  password_confirmation: attr(),
  challenge: attr(),
  message: attr(),

  messages: DS.hasMany('message')
});

Vine.User.reopenClass({
  checkUsername: function(username, email) {
    return Vine.ajax('/users/check_username', {
      data: { username: username, email: email }
    });
  }
});