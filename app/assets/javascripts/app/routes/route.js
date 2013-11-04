Vine.Route = Em.Route.extend({
  redirect: function() {
    if (Vine.SiteSettings.login_required && !Vine.User.current()) { route.transitionTo('login'); }
  }
});

Vine.Route.reopenClass({
  showModal: function(router, name, model) {
    router.controllerFor('modal').set('modalClass', null);
    router.render(name, {into: 'modal', outlet: 'modalBody'});
    var controller = router.controllerFor(name);
    if (controller) {
      if (model) {
        controller.set('model', model);
      }
      if(controller && controller.onShow) {
        controller.onShow();
      }
      controller.set('flashMessage', null);
    }
  }
});
