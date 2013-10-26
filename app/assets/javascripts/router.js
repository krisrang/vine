Vine.Router.map(function() {
  var router = this;
  
  this.route('notifications');

  Vine.StaticController.pages.forEach(function(p) {
    router.route(p, { path: "/" + p });
  });
});

Vine.Router.reopen({location: 'history'});