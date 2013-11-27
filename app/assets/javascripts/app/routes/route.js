Vine.Route = Em.Route.extend({
  activate: function(router, context) {
    this._super();

    // Close mini profiler
    $('.profiler-results .profiler-result').remove();

    // Close some elements that may be open
    $('[data-toggle="dropdown"]').parent().removeClass('open');
    
    // close the lightbox
    if ($.magnificPopup && $.magnificPopup.instance) { $.magnificPopup.instance.close(); }
  },

  beforeModel: function() {
    var signedIn = this.get('currentUser.isSignedIn');
    if (Vine.SiteSettings.login_required && !signedIn) { this.transitionTo('login'); }
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
