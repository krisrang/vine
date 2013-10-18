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

  start: function() {
    Vine.SiteSettings = PreloadStore.get('settings');
  }
});