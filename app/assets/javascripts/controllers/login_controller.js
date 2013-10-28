Vine.LoginController = Vine.Controller.extend(Vine.ModalFunctionality, {
  needs: ['modal', 'createAccount'],
  authenticate: null,
  loggingIn: false,

  hasAtLeastOneLoginButton: function() {
    return Em.get("Vine.LoginMethod.all").length > 0;
  }.property("Vine.LoginMethod.all.@each"),

  loginButtonText: function() {
    return this.get('loggingIn') ? I18n.t('login.logging_in') : I18n.t('login.title');
  }.property('loggingIn'),

  loginDisabled: function() {
    return this.get('loggingIn') || this.blank('loginName') || this.blank('loginPassword');
  }.property('loginName', 'loginPassword', 'loggingIn'),

  login: function() {
    this.set('loggingIn', true);

    var loginController = this;
    Vine.ajax("/session", {
      data: { login: this.get('loginName'), password: this.get('loginPassword') },
      type: 'POST'
    }).then(function (result) {
      // Successful login
      if (result.error) {
        loginController.set('loggingIn', false);
        if( result.reason === 'not_activated' ) {
          loginController.send('showNotActivated', {
            username: result.username,
            sentTo: result.sent_to_email,
            currentEmail: result.current_email
          });
        }
        loginController.flash(result.error, 'error');
      } else {
        // Trigger the browser's password manager using the hidden static login form:
        var $hidden_login_form = $('#hidden-login-form');
        $hidden_login_form.find('input[name=username]').val(loginController.get('loginName'));
        $hidden_login_form.find('input[name=password]').val(loginController.get('loginPassword'));
        $hidden_login_form.find('input[name=redirect]').val(window.location.href);
        $hidden_login_form.submit();
      }

    }, function(result) {
      // Failed to login
      loginController.flash(I18n.t('login.error'), 'error');
      loginController.set('loggingIn', false);
    });

    return false;
  },

  authMessage: (function() {
    if (this.blank('authenticate')) return "";
    var method = Vine.get('LoginMethod.all').findProperty("name", this.get("authenticate"));
    if(method){
      return method.get('message');
    }
  }).property('authenticate'),

  authenticationComplete: function(options) {
    if (options.awaiting_approval) {
      this.flash(I18n.t('login.awaiting_approval'), 'success');
      this.set('authenticate', null);
      return;
    }
    if (options.awaiting_activation) {
      this.flash(I18n.t('login.awaiting_confirmation'), 'success');
      this.set('authenticate', null);
      return;
    }
    // Reload the page if we're authenticated
    if (options.authenticated) {
      if (window.location.pathname === '/login') {
        window.location.pathname = '/';
      } else {
        window.location.reload();
      }
      return;
    }

    var createAccountController = this.get('controllers.createAccount');
    createAccountController.setProperties({
      accountEmail: options.email,
      accountUsername: options.username,
      authOptions: Em.Object.create(options)
    });
    this.send('showCreateAccount');
  }
});