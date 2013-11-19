Vine.CurrentUserController = Vine.ObjectController.extend({
  isSignedIn: function() {
    return this.get('content') && this.present('content');
  }.property('content'),

  isAdmin: function() {
    return this.get('content') && this.get('content.admin');
  }.property('content'),

  logout: function() {
    var vineUserController = this;
    return Vine.ajax("/session/" + this.get('content').get('username'), {
      type: 'DELETE'
    }).then(function () {
      Vine.KeyValueStore.abandonLocal();
      vineUserController.set('content', null);
      vineUserController.transitionToRoute('/login');
      window.location.pathname = Vine.getURL('/');
    });
  }
});