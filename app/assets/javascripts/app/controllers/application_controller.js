Vine.ApplicationController = Vine.Controller.extend({
  setupDOM: function() {
    $(window).focus(function() {
      Vine.set('hasFocus', true);
      Vine.set('notify', false);
    }).blur(function() {
      Vine.set('hasFocus', false);
    });

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

  setupListeners: function() {
    var loggedIn = this.get('currentUser.isSignedIn');

    if (loggedIn) {
      var bus = Vine.MessageBus;
      bus.callbackInterval = Vine.SiteSettings.polling_interval;
      bus.enableLongPolling = true;

      bus.subscribe("/refresh-browser", function(data){
        return document.location.reload(true);
      });
    }
  }
});