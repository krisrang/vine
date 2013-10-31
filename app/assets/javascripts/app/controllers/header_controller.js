Vine.HeaderController = Vine.Controller.extend({
  title: function() {
    return Vine.SiteSettings.title;
  }.property()
});