window.Vine = {};
Vine.SiteSettings = {};

Vine = Ember.Application.createWithMixins({
  start: function() {
    Vine.SiteSettings = PreloadStore.get('settings');
  }
});