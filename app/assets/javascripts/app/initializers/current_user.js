Ember.Application.initializer({
  name: 'currentUser',

  initialize: function(container) {
    var store = container.lookup('store:main');
    var userJson = PreloadStore.get('currentUser');

    if (userJson) {
      var serializer = store.serializerFor('user');
      var normalized = serializer.normalize(Vine.User, userJson.user);
      var user = store.push('user', normalized);

      container.lookup('controller:currentUser').set('content', user);
      container.typeInjection('controller', 'currentUser', 'controller:currentUser');
      container.typeInjection('route', 'currentUser', 'controller:currentUser');
    }
  }
});