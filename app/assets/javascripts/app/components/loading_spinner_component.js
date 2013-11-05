Vine.LoadingSpinnerComponent = Ember.Component.extend({
  didInsertElement: function() {
    var opts = {lines: 9, color: '#000', length: 20, zIndex: 1000};
    var target = document.getElementById('spinner');
    var spinner = new Spinner(opts).spin(target);
  }
});