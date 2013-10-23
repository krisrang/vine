Vine.HideModalView = Vine.ModalBodyView.extend({

  // No rendering!
  render: function(buffer) { },

  didInsertElement: function() {
    $('#vine-modal').modal('hide');
  }
});