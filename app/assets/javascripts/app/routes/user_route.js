Vine.UserRoute = Vine.Route.extend({

  actions: {
    logout: function() {
      this.get('currentUser').logout();
    }
  },

  model: function(params) {
    var currentUser = this.get('currentUser');

    if (currentUser && (params.id.toLowerCase() === currentUser.get('id'))) {
      return currentUser;
    }

    return this.store.find('user', params.id);
  },

  // serialize: function(params) {
  //   if (!params) return {};
  //   return { username: Em.get(params, 'username').toLowerCase() };
  // },

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