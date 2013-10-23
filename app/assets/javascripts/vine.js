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

  loginRequired: function() {
    return (
      Vine.SiteSettings.login_required && !Vine.User.current()
    );
  }.property(),

  redirectIfLoginRequired: function(route) {
    if(this.get('loginRequired')) { route.transitionTo('login'); }
  },

  initDom: function() {
    bootbox.setDefaults({
      animate: false,
      backdrop: true
    });

    $('#main').on('click.vine', 'a', function(e) {
      if (e.isDefaultPrevented() || e.shiftKey || e.metaKey || e.ctrlKey) { return; }

      var $currentTarget = $(e.currentTarget),
          href = $currentTarget.attr('href');

      if (!href ||
          href === '#' ||
          $currentTarget.attr('target') ||
          $currentTarget.data('ember-action') ||
          $currentTarget.data('auto-route') ||
          $currentTarget.hasClass('ember-view') ||
          $currentTarget.hasClass('lightbox') ||
          href.indexOf("mailto:") === 0 ||
          (href.match(/^http[s]?:\/\//i) && !href.match(new RegExp("^http:\\/\\/" + window.location.hostname, "i")))) {
         return;
      }

      e.preventDefault();
      Vine.URL.routeTo(href);
      return false;
    });
  },

  start: function() {
    Vine.SiteSettings = PreloadStore.get('settings');
    Vine.initDom();
  }
});