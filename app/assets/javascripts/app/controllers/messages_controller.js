Vine.MessagesController = Vine.ArrayController.extend({
  needs: ['editor'],

  sortProperties: ['createdAt'],
  sortAscending: false,

  actions: {
    newMessage: function() {
      var editor = this.get('controllers.editor');
      editor.newMessage();
    }
  },

  filteredContent: (function() {
    var result, sortedResult;

    result = this.filter(function(item, index) {
      return !(item.get('isNew'));
    });

    sortedResult = Em.ArrayProxy.createWithMixins(
      Ember.SortableMixin, 
      { content:result, sortProperties: this.sortProperties, sortAscending: this.sortAscending }
    );

    return sortedResult;
  }).property('content.isLoaded', 'content.@each.isNew')
});