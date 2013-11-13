Vine.StaticController.pages.forEach(function(page) {

  Vine[(page.capitalize()) + "Route"] = Vine.Route.extend({
    beforeModel: function() {},
    
    renderTemplate: function() {
      this.render('static');
    },

    setupController: function() {
      var config_key = Vine.StaticController.configs[page];
      if (config_key && Vine.SiteSettings[config_key].length > 0) {
        Vine.URL.redirectTo(Vine.SiteSettings[config_key]);
      } else {
        this.controllerFor('static').loadPath("/" + page);
      }
    }
  });
});