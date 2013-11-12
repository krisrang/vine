var attr = DS.attr;

Vine.Message = DS.Model.extend({
  source: attr(),
  cooked: attr(),
  createdAt: attr('date'),
  updatedAt: attr('date'),
  user: DS.belongsTo('user')
});