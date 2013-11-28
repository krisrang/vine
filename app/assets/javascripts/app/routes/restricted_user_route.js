Vine.RestrictedUserRoute = Vine.Route.extend({

  afterModel: function() {
    // var user = this.modelFor('user');
    // if (!user.get('can_edit')) {
    //   this.transitionTo('userActivity');
    // }
  }

});
