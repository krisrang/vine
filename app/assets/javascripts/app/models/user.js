Vine.User = Vine.Model.extend({
  // username: DS.attr('string'),
  // email: DS.attr('string'),
  // created_at: DS.attr('date'),
  // updated_at: DS.attr('date'),
  // admin: DS.attr('boolean'),
  // messages: DS.hasMany('Vine.Message')

  // fullName: ( -> 
  //   return this.get('firstName') + ' ' + this.get('lastName')
  // ).property('firstName', 'lastName')

  findDetails: function() {
    var user = this;

    return PreloadStore.getAndRemove("user_" + user.get('username'), function() {
      return Vine.ajax("/users/" + user.get('username') + '.json');
    }).then(function (json) {

      // if (json.user.invited_by) {
      //   json.user.invited_by = Vine.User.create(json.user.invited_by);
      // }

      user.setProperties(json.user);
      return user;
    });
  }
});

Vine.User.reopenClass(Vine.Singleton, {
  findByUsername: function(username) {
    var user = Vine.User.create({username: username});
    return user.findDetails();
  },

  createCurrent: function() {
    var userJson = PreloadStore.get('currentUser');
    if (userJson) { return Vine.User.create(userJson); }
    return null;
  },

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
  },

  logout: function() {
    var vineUserClass = this;
    return Vine.ajax("/session/" + Vine.User.currentProp('username'), {
      type: 'DELETE'
    }).then(function () {
      vineUserClass.currentUser = null;
    });
  }
});