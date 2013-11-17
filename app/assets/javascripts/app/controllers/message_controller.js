Vine.MessageController = Vine.ObjectController.extend({
  needs: ['editor'],

  actions: {
    editMessage: function() {
      var editor = this.get('controllers.editor');
      editor.editMessage(this.get('model'));
    }
  }
});