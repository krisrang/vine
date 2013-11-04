Vine.MessagesRoute = Vine.Route.extend({
  model: function() {
    return Vine.Message.getLatest();
  }
});