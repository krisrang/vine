Ember.Application.initializer({
  name: 'currentUser',

  initialize: function(container) {
    var userJson = PreloadStore.get('currentUser');

    if (userJson) {
      var user = Vine.User.create(userJson);

      container.lookup('controller:currentUser').set('content', user);
      container.typeInjection('controller', 'currentUser', 'controller:currentUser');
      container.typeInjection('route', 'currentUser', 'controller:currentUser');
    }
  }
});