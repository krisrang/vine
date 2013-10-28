Vine.NotActivatedController = Vine.Controller.extend(Vine.ModalFunctionality, {
  emailSent: false,

  sendActivationEmail: function() {
    Vine.ajax('/users/' + this.get('username') + '/send_activation_email', {type: 'POST'});
    this.set('emailSent', true);
  }
});