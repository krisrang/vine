Ember.Application.initializer({
  name: 'currentUser',

  initialize: function(container) {
    var store = container.lookup('store:main');
    var userJson = PreloadStore.get('currentUser');

    if (userJson) {
      var user = store.push('user', userJson);

      container.lookup('controller:currentUser').set('content', user);
      container.typeInjection('controller', 'currentUser', 'controller:currentUser');
      container.typeInjection('route', 'currentUser', 'controller:currentUser');
    }
  }
});