Vine = Ember.Application.createWithMixins(Vine.Ajax, {
  getURL: function(url) {
    // If it's a non relative URL, return it.
    if (url.indexOf('http') === 0) return url;
    return url;
  },

  logout: function() {
    Vine.User.logout().then(function() {
      window.location.pathname = Vine.getURL('/');
    });
  },

  authenticationComplete: function(options) {
    // TODO, how to dispatch this to the controller without the container?
    var loginController = Vine.__container__.lookup('controller:login');
    return loginController.authenticationComplete(options);
  },

  loginRequired: function() {
    return (
      Vine.SiteSettings.login_required && !Vine.User.current()
    );
  }.property(),

  redirectIfLoginRequired: function(route) {
    if(this.get('loginRequired')) { route.transitionTo('login'); }
  },

  initDom: function() {
    Vine.csrfToken = $('meta[name=csrf-token]').attr('content');

    $.ajaxPrefilter(function(options, originalOptions, xhr) {
      if (!options.crossDomain) {
        xhr.setRequestHeader('X-CSRF-Token', Vine.csrfToken);
      }
    });

    bootbox.setDefaults({
      animate: false,
      backdrop: true
    });
  },

  start: function() {
    Vine.initDom();
    Vine.MessageBus.alwaysLongPoll = Vine.Environment === "development";
    Vine.MessageBus.start();
  }
});