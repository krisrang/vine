var attr = DS.attr;

Vine.User = DS.Model.extend({
  username: attr(),
  email: attr(),
  created_at: attr('date'),
  updated_at: attr('date'),
  admin: attr('boolean')
  // messages: DS.hasMany('Vine.Message')
});

Vine.User.reopenClass({
  checkUsername: function(username, email) {
    return Vine.ajax('/users/check_username', {
      data: { username: username, email: email }
    });
  },

  // We do this as a regular ajax request since we don't need to push it into store here
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