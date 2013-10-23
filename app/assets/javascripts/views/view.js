Vine.View = Ember.View.extend(Vine.Presence, {});

Vine.View.reopenClass({
  registerHelper: function(helperName, helperClass) {
    Ember.Handlebars.registerHelper(helperName, function(options) {
      var hash = options.hash,
          types = options.hashTypes;

      Vine.Utilities.normalizeHash(hash, types);
      return Ember.Handlebars.helpers.view.call(this, helperClass, options);
    });
  },

  renderIfChanged: function() {
    var args = Array.prototype.slice.call(arguments, 0);
    args.unshift(function () { this.rerender(); });
    return Ember.observer.apply(this, args);
  }
});