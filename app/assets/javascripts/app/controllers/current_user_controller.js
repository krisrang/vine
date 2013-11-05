Vine.CurrentUserController = Ember.ObjectController.extend({
  isSignedIn: function() {
    return this.get('content') && this.get('content').get('isLoaded');
  }.property('content.isLoaded'),

  logout: function() {
    var vineUserController = this;
    return Vine.ajax("/session/" + this.get('content').get('username'), {
      type: 'DELETE'
    }).then(function () {
      vineUserController.set('content', null);
      window.location.pathname = Vine.getURL('/');
    });
  }
});