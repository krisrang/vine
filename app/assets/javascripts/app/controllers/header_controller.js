Vine.HeaderController = Vine.Controller.extend({
  title: function() {
    return Vine.SiteSettings.title;
  }.property(),

  icon: function() {
    return assetPath('logo20w.png');
  }.property()
});