Vine.Message = Vine.Model.extend({

});

Vine.Message.reopenClass({
  getLatest: function() {
    return PreloadStore.getAndRemove("messages_latest").then(function(result) {
      
    });
  }
});