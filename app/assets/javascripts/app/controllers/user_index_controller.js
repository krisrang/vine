Vine.UserIndexController = Em.ObjectController.extend({
  viewingSelf: function() {
    return this.get('content.username') === this.get('currentUser.username');
  }.property('content.username'),

  canEdit: function() {
    return this.get('viewingSelf') || this.get('currentUser.isAdmin');
  }.property('viewingSelf')
});

