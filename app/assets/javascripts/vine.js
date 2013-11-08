Vine = Ember.Application.createWithMixins(Vine.Ajax, {
  Resolver: Vine.Resolver,
  URL_FIXTURES: {},

  hasFocus: true,

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

  start: function() {
    Vine.MessageBus.alwaysLongPoll = Vine.Environment === "development";
    Vine.MessageBus.start();

    Vine.KeyValueStore.init("vine_", Vine.MessageBus);
  }
});