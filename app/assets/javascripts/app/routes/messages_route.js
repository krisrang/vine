Vine.MessagesRoute = Vine.Route.extend({
  activate: function() {
    Vine.set('title', '');
  },

  setupController: function(controller) {
    var route = this;

    PreloadStore.getAndRemove("draft").then(
      function(result) {
        if (result && result.draft) {
          var editor = route.controllerFor('editor');
          var draft = Vine.Draft.create(result.draft);
          editor.openDraft(draft);
        }
      }
    );

    PreloadStore.getAndRemove("messages_latest", Vine.ajax("/messages.json")).then(function(result) {
      var messages = Em.A();

      if (result) {
        _.each(result, function(message) {
          messages.push(Vine.Message.create(message));
        });
      }

      controller.set('model', messages);
    });
  }
});