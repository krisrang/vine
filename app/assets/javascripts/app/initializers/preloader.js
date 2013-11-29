Ember.Application.initializer({
  name: 'preloader',

  initialize: function(container) {
    var store = container.lookup('store:main');
    var users = PreloadStore.get('users');

    if (users) {
      store.pushPayload('user', users);
    }
  }
});