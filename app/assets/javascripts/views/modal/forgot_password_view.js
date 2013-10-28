Vine.ForgotPasswordView = Vine.ModalBodyView.extend({
  templateName: 'modal/forgot_password',
  title: I18n.t('forgot_password.title'),

  didInsertElement: function(e) {
    this._super();

    // allows the submission the form when pressing 'ENTER' on *any* text input field
    // but only when the submit button is enabled
    var controller = this.get('controller');
    Em.run.schedule('afterRender', function() {
      $("input[type='text']").keydown(function(e) {
        if (controller.get('submitDisabled') === false && e.keyCode === 13) {
          controller.submit();
        }
      });
    });
  }
});