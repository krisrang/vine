Vine.CurrentUserController = Ember.ObjectController.extend({
  isSignedIn: function() {
    return this.get('content') && !Ember.isEmpty(this.get('content'));
  }.property('content'),

  logout: function() {
    var vineUserController = this;
    return Vine.ajax("/session/" + this.get('content').get('username'), {
      type: 'DELETE'
    }).then(function () {
      vineUserController.set('content', null);
      vineUserController.transitionToRoute('/login');
      window.location.pathname = Vine.getURL('/');
    });
  }
});