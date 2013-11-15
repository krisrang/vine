Vine.MessagesController = Vine.ArrayController.extend({
  needs: ['editor'],

  sortProperties: ['createdAt'],
  sortAscending: false,

  actions: {
    newMessage: function() {
      var editor = this.get('controllers.editor');
      editor.open({});
    }
  },

  draftLoaded: function() {
    var draft = this.get('draft');
    if (draft) {
      return this.get('controllers.editor').open({
        draft: draft,
        ignoreIfChanged: true
      });
    }
  }.observes('draft.isLoaded')
});