Vine.UserIndexRoute = Vine.RestrictedUserRoute.extend({
  model: function() {
    return this.modelFor('user');
  },

  setupController: function(controller, model) {
    controller.set('model', model);
  }
});