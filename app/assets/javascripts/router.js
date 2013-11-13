Vine.Router.map(function() {
  var router = this;
  
  this.resource('messages', { path: '/' });
  this.resource('users', { path: '/users' });
  this.resource('user', { path: '/user/:user_id' });
  
  this.route('media');
  this.route('notifications');
  this.route('preferences');

  this.route('search', { path: '/search/:query' });

  Vine.StaticController.pages.forEach(function(p) {
    router.route(p, { path: "/" + p });
  });
});

Vine.Router.reopen({location: 'history'});