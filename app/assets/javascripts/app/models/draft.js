var attr = DS.attr;

Vine.Draft = DS.Model.extend({
  reply: attr(),
  action: attr(),
  createdAt: attr('date'),

  user: DS.belongsTo('user')
});

Vine.Draft.reopenClass({
  clear: function(key, sequence) {
    return Vine.ajax("/drafts.json", {type: 'DELETE'});
  }
});