Vine.AuthenticatedRoute = Vine.Route.extend({
  redirect: function() { Vine.redirectIfLoginRequired(this); }
});