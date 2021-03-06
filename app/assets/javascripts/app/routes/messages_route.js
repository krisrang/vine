Vine.MessagesRoute = Vine.Route.extend({
  activate: function() {
    Vine.set('title', '');
  },

  setupController: function(controller) {
    var store = this.store,
        route = this;

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

    PreloadStore.getAndRemove("draft").then(
      function(result) {
        if (result && result.draft) {
          var editor = route.controllerFor('editor');
          var draft = Vine.Draft.create(result.draft);
          editor.openDraft(draft);
        }
      }
    );
  }
});