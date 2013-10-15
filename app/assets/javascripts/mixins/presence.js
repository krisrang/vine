Vine.Presence = Em.Mixin.create({
  blank: function(name) {
    return Ember.isEmpty(this[name] || this.get(name));
  },

  present: function(name) {
    return !this.blank(name);
  }
});