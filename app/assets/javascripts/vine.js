Vine = Ember.Application.createWithMixins(Vine.Ajax, {
  hasFocus: true,

  Resolver: Vine.Resolver,

  URL_FIXTURES: {},

  getURL: function(url) {
    // If it's a non relative URL, return it.
    if (url.indexOf('http') === 0) return url;
    return url;
  },

  titleChanged: function() {
    var title = "";
    if (this.get('title')) {
      title += "" + (this.get('title')) + " - ";
    }
    title += Vine.SiteSettings.title;
    $('title').text(title);

    var notifyCount = this.get('notifyCount');
    if (notifyCount > 0) {
      title = "(" + notifyCount + ") " + title;
    }

    // chrome bug workaround see: http://stackoverflow.com/questions/2952384/changing-the-window-title-when-focussing-the-window-doesnt-work-in-chrome
    window.setTimeout(function() {
      document.title = ".";
      document.title = title;
    }, 200);
  }.observes('title', 'hasFocus', 'notifyCount'),

  notifyTitle: function(count) {
    this.set('notifyCount', count);
  },

  authenticationComplete: function(options) {
    // TODO, how to dispatch this to the controller without the container?
    var loginController = Vine.__container__.lookup('controller:login');
    return loginController.authenticationComplete(options);
  },

  initDom: function() {
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

  subscribeToNotifications: function() {
    var user = Vine.User.current();

    if (user) {
      var bus = Vine.MessageBus;
      bus.callbackInterval = Vine.SiteSettings.polling_interval;
      bus.enableLongPolling = true;

      bus.subscribe("/refresh-browser", function(data){
        return document.location.reload(true);
      });
    }
  },

  start: function() {
    Vine.initDom();
    Vine.MessageBus.alwaysLongPoll = Vine.Environment === "development";
    Vine.MessageBus.start();

    Vine.subscribeToNotifications();
  }
});