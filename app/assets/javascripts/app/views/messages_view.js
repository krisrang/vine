Vine.MessagesView = Vine.View.extend({
  didInsertElement: function() {
    $('.messages-controls').affix({
      offset: { top: 20 }
    });
  }
});