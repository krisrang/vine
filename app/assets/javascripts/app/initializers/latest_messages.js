Ember.Application.initializer({
  name: 'latestMessages',

  initialize: function(container) {
    var store = container.lookup('store:main');
    // PreloadStore.getAndRemove("messages_latest").then(function(result) {
    //   _.each(result.messages, function(message){
    //     store.push('message', message);
    //   });
    // });
  }
});