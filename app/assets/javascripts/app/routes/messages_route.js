Vine.MessagesRoute = Vine.Route.extend({
  model: function() {
    return Em.A();
    // return this.store.findAll('message');
  }
});