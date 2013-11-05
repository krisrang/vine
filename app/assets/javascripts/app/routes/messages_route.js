Vine.MessagesRoute = Vine.Route.extend({
  setupController: function(controller) {
    var messages = Em.A();

    var finder = function() {
      var url = Vine.getURL("/messages") + ".json";
      return Vine.ajax(url);
    };

    PreloadStore.getAndRemove("messages_latest", finder).then(function(result) {
      _.each(result, function(message){
        messages.addObject(Vine.Message.create(message));
      });
    });
    
    controller.set('model', messages);
  }
});