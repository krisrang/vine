Vine.MessagesController = Vine.ArrayController.extend({
  needs: ['editor'],

  sortProperties: ['created_at'],
  sortAscending: false,

  actions: {
    newMessage: function() {
      var editor = this.get('controllers.editor');
      editor.open({});
    }
  }
});