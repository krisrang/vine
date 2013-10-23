Vine.LoginView = Vine.ModalBodyView.extend({
  templateName: 'modal/login',
  title: I18n.t('login.title'),


  mouseMove: function(e) {
    this.set('controller.lastX', e.screenX);
    this.set('controller.lastY', e.screenY);
  },

  initPersona: function(){
    var readyCalled = false;
    navigator.id.watch({
      onlogin: function(assertion) {
        if (readyCalled) {
          Vine.ajax('/auth/persona/callback', {
            type: 'POST',
            data: { 'assertion': assertion },
            dataType: 'json'
          }).then(function(data) {
            Vine.authenticationComplete(data);
          });
        }
      },
      onlogout: function() {
        if (readyCalled) {
          Vine.logout();
        }
      },
      onready: function() {
        readyCalled = true;
      }
    });
  },

  didInsertElement: function(e) {

    this._super();

    var loginController = this.get('controller');

    // Get username and password from the browser's password manager,
    // if it filled the hidden static login form:
    loginController.set('loginName', $('#hidden-login-form input[name=username]').val());
    loginController.set('loginPassword', $('#hidden-login-form input[name=password]').val());


    Em.run.schedule('afterRender', function() {
      $('#login-account-password, #login-account-name').keydown(function(e) {
        if (e.keyCode === 13) {
          loginController.login();
        }
      });
    });

    var view = this;
    // load persona if needed
    if(Vine.SiteSettings.enable_persona_logins) {
      $LAB.script("https://login.persona.org/include.js").wait(view.initPersona);
    }
  }
});