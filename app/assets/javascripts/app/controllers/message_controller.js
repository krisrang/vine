Vine.MessageController = Vine.ObjectController.extend({
  needs: ['editor'],

  actions: {
    deleteMessage: function() {
      this.deleteMessage();
    },

    editMessage: function() {
      var editor = this.get('controllers.editor');
      editor.editMessage(this.get('model'));
    },

    replyMessage: function() {
      var editor = this.get('controllers.editor');
      editor.replyMessage(this.get('model'));
    }
  },

  canDestroy: function() {
    return this.get('currentUser.isAdmin') || (this.get('currentUser.isSignedIn') && this.get('currentUser.id') === this.get('model.user.id'));
  }.property('currentUser', 'model.user'),

  canEdit: function() {
    return this.get('currentUser.isAdmin') || (this.get('currentUser.isSignedIn') && this.get('currentUser.id') === this.get('model.user.id'));
  }.property('currentUser', 'model.user'),

  deleteMessage: function() {
    var model = this.get('model');

    bootbox.confirm(I18n.t("message.destroy"), function(result) {
      if (result) {
        model.deleteRecord();
        model.save();
      }
    });
  }
});