Vine.ApplicationRoute = Em.Route.extend({
  actions: {
    showLogin: function() {
      Vine.Route.showModal(this, 'login');
    },

    showCreateAccount: function() {
      Vine.Route.showModal(this, 'createAccount');
    },

    showForgotPassword: function() {
      Vine.Route.showModal(this, 'forgotPassword');
    },

    showNotActivated: function(props) {
      Vine.Route.showModal(this, 'notActivated');
      this.controllerFor('notActivated').setProperties(props);
    },

    closeModal: function() {
      this.render('hide_modal', {into: 'modal', outlet: 'modalBody'});
    },

    hideModal: function() {
      $('#vine-modal').modal('hide');
    },

    showModal: function() {
      $('#vine-modal').modal('show');
    },

    login: function() {
      var controller = this.controllerFor('login');
      controller.loginAction();
    },

    externalLogin: function(loginMethod){
      var controller = this.controllerFor('login');
      controller.externalLoginAction(loginMethod);
    },

    logout: function() {
      this.get('currentUser').logout();
    },

    createAccount: function() {
      var controller = this.controllerFor('createAccount');
      controller.createAccountAction();
    }
  },

  setupController: function(controller) {
    var user = this.get('currentUser');

    if (user) {
      var bus = Vine.MessageBus;
      bus.callbackInterval = Vine.SiteSettings.polling_interval;
      bus.enableLongPolling = true;

      bus.subscribe("/refresh-browser", function(data){
        return document.location.reload(true);
      });
    }
  }
});
