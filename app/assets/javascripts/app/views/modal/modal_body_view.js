Vine.ModalBodyView = Vine.View.extend({
  didInsertElement: function() {
    $('#vine-modal').modal('show');

    $('#modal-alert').hide();

    if (!Vine.Mobile.mobileView) {
      var modalBodyView = this;
      Em.run.schedule('afterRender', function() {
        var test = modalBodyView.$('input:first');
        modalBodyView.$('input:first').focus();
      });
    }

    var title = this.get('title');
    if (title) {
      this.set('controller.controllers.modal.title', title);
    }
  },

  // Pass the errors to our errors view
  displayErrors: function(errors, callback) {
    this.set('parentView.parentView.modalErrorsView.errors', errors);
    if (typeof callback === "function") callback();
  },

  flashMessageChanged: function() {
    var flashMessage = this.get('controller.flashMessage');
    if (flashMessage) {
      var messageClass = flashMessage.get('messageClass') || 'success';
      var $alert = $('#modal-alert').hide().removeClass('alert-error', 'alert-success');
      $alert.addClass("alert alert-" + messageClass).html(flashMessage.get('message'));
      $alert.fadeIn();
    }
  }.observes('controller.flashMessage')

});