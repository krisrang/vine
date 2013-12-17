// var attr = DS.attr;

Vine.Message = Vine.Model.extend({
  // source: attr(),
  // cooked: attr(),
  // imageSizes: attr(),
  // createdAt: attr('date'),
  // updatedAt: attr('date'),
  // user: DS.belongsTo('user'),

  timestamp: function() {
    return this.get('createdAt').getTime()/1000;
  }.property('createdAt')
});