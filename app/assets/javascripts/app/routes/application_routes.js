Vine.Router.map(function() {
  var router = this;
  
  this.resource('messages', { path: '/' });
  
  // User routes
  this.resource('user', { path: '/users/:username' }, function() {
    this.resource('preferences', { path: '/preferences' });
  });
  
  this.route('media');

  this.route('search', { path: '/search/:query' });

  Vine.StaticController.pages.forEach(function(p) {
    router.route(p, { path: "/" + p });
  });
});

Vine.Router.reopen({location: 'history'});