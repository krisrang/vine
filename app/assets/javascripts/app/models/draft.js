var attr = DS.attr;

// The actions the editor can take
var REPLY = 'reply',
    EDIT = 'edit';

Vine.Draft = DS.Model.extend({
  reply: attr(),
  action: attr(),
  message_id: attr('integer'),
  createdAt: attr('date'),

  user: DS.belongsTo('user'),

  editingMessage: Em.computed.equal('action', EDIT),
  replyingToMessage: Em.computed.equal('action', REPLY),

  replyDirty: function() {
    if (this.get('message')) {
      return this.get('reply') !== this.get('message.source');
    } else {
      return !Em.isEmpty(this.get('reply'));
    }
  }.property('reply'),

  replyLength: function() {
    var reply = this.get('reply') || "";
    while (Vine.Quote.REGEXP.test(reply)) { reply = reply.replace(Vine.Quote.REGEXP, ""); }
    return reply.replace(/\s+/img, " ").trim().length;
  }.property('reply')
});

Vine.Draft.reopenClass({
  REPLY: REPLY,
  EDIT: EDIT,

  clear: function() {
    return Vine.ajax("/drafts", {type: 'DELETE'});
  }
});