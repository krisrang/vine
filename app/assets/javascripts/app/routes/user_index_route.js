Vine.UserIndexRoute = Vine.Route.extend({
  redirect: function() {
    this.transitionTo('userActivity', this.modelFor('user'));
  }
});
