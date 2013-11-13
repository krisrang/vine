Vine.MessageView = Vine.View.extend({
  tagName: 'li',
  classNameBindings: ['idClass', ':message-view'],

  idClass: function() {
    return "message-" + this.get("controller.content.id");
  }.property('controller.content.id')
});