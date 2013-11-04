Vine.AuthenticatedRoute = Vine.Route.extend({
  redirect: function() {
    if (Vine.SiteSettings.login_required && !Vine.User.current()) { route.transitionTo('login'); }
  }
});