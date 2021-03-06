Vine.ForgotPasswordController = Vine.Controller.extend(Vine.ModalFunctionality, {

  // You need a value in the field to submit it.
  submitDisabled: function() {
    return this.blank('accountEmailOrUsername');
  }.property('accountEmailOrUsername'),

  submit: function() {
    Vine.ajax("/session/forgot_password", {
      data: { login: this.get('accountEmailOrUsername') },
      type: 'POST'
    });

    // don't tell people what happened, this keeps it more secure (ensure same on server)
    this.flash(I18n.t('forgot_password.complete'));
    return false;
  }
});
