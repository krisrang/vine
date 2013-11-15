Vine.MessagesRoute = Vine.Route.extend({
  setupController: function(controller) {
    var store = this.store;

    PreloadStore.getAndRemove("messages_latest").then(function(result) {
      if (result && result.messages) {
        _.each(result.messages, function(message) {
          store.push('message', message);
        });

        controller.set('model', store.all('message'));
      } else {
        controller.set('model', store.findAll('message'));
      }      
    });

    Vine.ajax('/drafts.json').then(
      function(result) {
        if (result && result.draft) {
          var draft = store.push('draft', result.draft);
          controller.set('draft', draft);
        }
      }
    );
  }
});