Vine.CreateAccountController = Vine.Controller.extend(Vine.ModalFunctionality, {
  uniqueUsernameValidation: null,
  complete: false,
  accountPasswordConfirm: 0,
  accountChallenge: 0,
  formSubmitted: false,
  rejectedEmails: Em.A([]),

  onShow: function(){
    this.set('controllers.modal.modalClass', 'create-account');
  },

  submitDisabled: function() {
    if (this.get('formSubmitted')) return true;
    if (this.get('emailValidation.failed')) return true;
    if (this.get('usernameValidation.failed')) return true;
    if (this.get('passwordValidation.failed')) return true;
    return false;
  }.property('emailValidation.failed', 'usernameValidation.failed', 'passwordValidation.failed', 'formSubmitted'),

  passwordRequired: function() {
    return this.blank('authOptions.auth_provider');
  }.property('authOptions.auth_provider'),

  // Check the email address
  emailValidation: function() {
    // If blank, fail without a reason
    var email;
    if (this.blank('accountEmail')) {
      return Vine.InputValidation.create({
        failed: true
      });
    }

    if (this.get('accountPasswordConfirm') === 0) {
      this.fetchConfirmationValue();
    }

    email = this.get("accountEmail");

    if (this.get('rejectedEmails').contains(email)) {
      return Vine.InputValidation.create({
        failed: true,
        reason: I18n.t('user.email.invalid')
      });
    }

    if ((this.get('authOptions.email') === email) && this.get('authOptions.email_valid')) {
      return Vine.InputValidation.create({
        ok: true,
        reason: I18n.t('user.email.authenticated', {
          provider: this.get('authOptions.auth_provider')
        })
      });
    }

    if (Vine.Utilities.emailValid(email)) {
      return Vine.InputValidation.create({
        ok: true,
        reason: I18n.t('user.email.ok')
      });
    }

    return Vine.InputValidation.create({
      failed: true,
      reason: I18n.t('user.email.invalid')
    });
  }.property('accountEmail', 'rejectedEmails.@each'),

  basicUsernameValidation: function() {
    this.set('uniqueUsernameValidation', null);

    // If blank, fail without a reason
    if (this.blank('accountUsername')) {
      return Vine.InputValidation.create({
        failed: true
      });
    }

    // If too short
    if (this.get('accountUsername').length < 3) {
      return Vine.InputValidation.create({
        failed: true,
        reason: I18n.t('user.username.too_short')
      });
    }

    // If too long
    if (this.get('accountUsername').length > 15) {
      return Vine.InputValidation.create({
        failed: true,
        reason: I18n.t('user.username.too_long')
      });
    }

    this.checkUsernameAvailability();
    // Let's check it out asynchronously
    return Vine.InputValidation.create({
      failed: true,
      reason: I18n.t('user.username.checking')
    });
  }.property('accountUsername'),

  shouldCheckUsernameMatch: function() {
    return !this.blank('accountUsername') && this.get('accountUsername').length > 2;
  },

  checkUsernameAvailability: Vine.debounce(function() {
    var _this = this;
    if (this.shouldCheckUsernameMatch()) {
      return Vine.User.checkUsername(this.get('accountUsername'), this.get('accountEmail')).then(function(result) {
        if (result.available) {
          return _this.set('uniqueUsernameValidation', Vine.InputValidation.create({
            ok: true,
            reason: I18n.t('user.username.available')
          }));
        } else {
          if (result.suggestion) {
            return _this.set('uniqueUsernameValidation', Vine.InputValidation.create({
              failed: true,
              reason: I18n.t('user.username.not_available', result)
            }));
          } else if (result.errors) {
            return _this.set('uniqueUsernameValidation', Vine.InputValidation.create({
              failed: true,
              reason: result.errors.join(' ')
            }));
          }
        }
      });
    }
  }, 500),

  // Actually wait for the async name check before we're 100% sure we're good to go
  usernameValidation: function() {
    var basicValidation, uniqueUsername;
    basicValidation = this.get('basicUsernameValidation');
    uniqueUsername = this.get('uniqueUsernameValidation');
    if (uniqueUsername) {
      return uniqueUsername;
    }
    return basicValidation;
  }.property('uniqueUsernameValidation', 'basicUsernameValidation'),

  // Validate the password
  passwordValidation: function() {
    var password;
    if (!this.get('passwordRequired')) {
      return Vine.InputValidation.create({
        ok: true
      });
    }

    // If blank, fail without a reason
    password = this.get("accountPassword");
    if (this.blank('accountPassword')) {
      return Vine.InputValidation.create({ failed: true });
    }

    // If too short
    if (password.length < 6) {
      return Vine.InputValidation.create({
        failed: true,
        reason: I18n.t('user.password.too_short')
      });
    }

    // Looks good!
    return Vine.InputValidation.create({
      ok: true
      // reason: I18n.t('user.password.ok')
    });
  }.property('accountPassword'),

  passwordStrengthMessage: function() {
    var score;
    score = this.passwordStrength();

    switch(score) {
      case 4:
        return I18n.t('user.password.very_strong');
      case 3:
        return I18n.t('user.password.strong');
      case 2:
        return I18n.t('user.password.medium');
      case 1:
        return I18n.t('user.password.weak');
      default:
        return I18n.t('user.password.very_weak');
    }
  }.property('accountPassword'),

  passwordStrengthClass: function() {
    var score;
    score = this.passwordStrength();

    return "strength-" + score;
  }.property('accountPassword'),

  passwordStrength: function() {
    var strength, password;
    var inputs = [];

    password = this.get("accountPassword");
    if (this.blank('accountPassword')) {
      return 0;
    }

    if (!this.blank('accountUsername')) {
      inputs.push(this.get('accountUsername'));
    }

    if (!this.blank('accountEmail')) {
      inputs.push(this.get('accountEmail'));
    }

    strength = zxcvbn(this.get('accountPassword'), inputs);
    return strength.score;
  },

  fetchConfirmationValue: function() {
    var createAccountController = this;
    return Vine.ajax('/users/hp.json').then(function (json) {
      createAccountController.set('accountPasswordConfirm', json.value);
      createAccountController.set('accountChallenge', json.challenge.split("").reverse().join(""));
    });
  },

  createAccountAction: function() {
    var store = this.get('store'); 
    var createAccountController = this;
    this.set('formSubmitted', true);

    var user = store.createRecord('user', {
      email: this.get('accountEmail'),
      password: this.get('accountPassword'),
      username: this.get('accountUsername'),
      password_confirmation: this.get('accountPasswordConfirm'),
      challenge: this.get('accountChallenge')
    });

    var test = user.save();

    return test.then(function(result) {
      createAccountController.set('complete', true);

      if (result.get('message')) {
        createAccountController.flash(result.get('message'));
      }

      if (result.get('active')) {
        return window.location.reload();
      }
    }, function(result) {
      var errors = result.errors;

      createAccountController.set('formSubmitted', false);
      if (errors.values && errors.values.email) {
        createAccountController.get('rejectedEmails').pushObject(errors.values.email);
      }
      return createAccountController.flash(errors.message || I18n.t('create_account.failed'), 'error');
    });
  }
});
