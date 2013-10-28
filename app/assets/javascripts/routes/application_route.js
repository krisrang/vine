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

    externalLogin: function(loginMethod){
      var controller = this.controllerFor('login');
      var name = loginMethod.get("name");
      var customLogin = loginMethod.get("customLogin");

      if (customLogin) {
        customLogin();
      } else {
        controller.set('authenticate', name);
        var left = controller.get('lastX') - 400;
        var top = controller.get('lastY') - 200;

        var height = loginMethod.get("frameHeight") || 400;
        var width = loginMethod.get("frameWidth") || 800;
        window.open(Vine.getURL("/auth/" + name), "_blank",
            "menubar=no,status=no,height=" + height + ",width=" + width +  ",left=" + left + ",top=" + top);
      }
    }
  }
});
