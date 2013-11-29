Vine.UserRoute = Vine.Route.extend({

  actions: {
    logout: function() {
      this.get('currentUser').logout();
    }
  },

  model: function(params) {
    var currentUser = this.get('currentUser'),
        username = params.username.toLowerCase(),
        store = this.store;

    if (currentUser && (username === currentUser.get('usernameLower'))) {
      return currentUser;
    }

    var promise = Ember.Deferred.create();

    PreloadStore.getAndRemove("users").then(function(result) {
      var id;

      if (result && result.users) {
        _.each(result.users, function(user) {
          if (user.usernameLower === username) id = user.id;
        });
      }

      if (id > 0) {
        promise.resolve(store.find('user', id));
      } else {
        store.find('user', {username: username}).then(function(result) {
          if (result && result.get('length') > 0) {
            promise.resolve(result.get('firstObject'));
          }
        });
      }
    });

    return promise;
  },

  serialize: function(params) {
    if (!params) return {};
    return { username: Em.get(params, 'username').toLowerCase() };
  },

  setupController: function(controller, user) {
    controller.set('model', user);
  },

  activate: function() {
    this._super();
    var user = this.modelFor('user');
    Vine.MessageBus.subscribe("/users/" + user.get('usernameLower'), function(data) {
      user.loadUserAction(data);
    });
  },

  deactivate: function() {
    this._super();
    Vine.MessageBus.unsubscribe("/users/" + this.modelFor('user').get('usernameLower'));
  }
});