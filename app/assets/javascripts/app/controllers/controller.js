Vine.Controller = Ember.Controller.extend(Vine.Presence, Vine.HasCurrentUser, {
  routeChanged: function(){
    if (window.analytics === undefined) { return; }

    if(this.afterFirstHit) {
      Em.run.schedule('afterRender', function() {
        analytics.pageview();
      });
    } else {
      this.afterFirstHit = true;
    }
  }.observes('currentPath')
});