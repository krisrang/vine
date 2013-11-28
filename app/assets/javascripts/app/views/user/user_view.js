Vine.UserView = Vine.View.extend({
  templateName: 'user/user',
  userBinding: 'controller.content',

  updateTitle: function() {
    var username;
    username = this.get('user.username');
    if (username) {
      return Vine.set('title', "" + (I18n.t("user.profile")) + " - " + username);
    }
  }.observes('user.loaded', 'user.username')
});
