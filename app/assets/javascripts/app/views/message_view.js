Vine.MessageView = Vine.View.extend({
  tagName: 'li',
  classNameBindings: ['idClass'],

  idClass: function() {
    return "message-" + this.get("controller.content.id");
  }.property('controller.content.id')
});