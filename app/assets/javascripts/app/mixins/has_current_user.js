Vine.HasCurrentUser = Em.Mixin.create({
  currentUser: function() {
    return Vine.User.current();
  }.property().volatile()
});