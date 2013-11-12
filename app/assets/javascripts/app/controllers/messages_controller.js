Vine.MessagesController = Vine.ArrayController.extend({
  needs: ['editor'],

  sortProperties: ['createdAt'],
  sortAscending: false,

  actions: {
    newMessage: function() {
      var editor = this.get('controllers.editor');
      editor.open({});
    }
  }
});