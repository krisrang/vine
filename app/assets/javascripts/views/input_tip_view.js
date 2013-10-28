Vine.InputTipView = Vine.View.extend({
  classNameBindings: [':tip', 'good', 'bad'],

  shouldRerender: Vine.View.renderIfChanged('validation'),
  bad: Em.computed.alias('validation.failed'),
  good: Em.computed.not('bad'),

  render: function(buffer) {
    var reason = this.get('validation.reason');
    if (reason) {
      var icon = this.get('good') ? 'check' : 'times';
      return buffer.push("<i class=\"fa fa-" + icon + "\"></i> " + reason);
    }
  }
});

Vine.View.registerHelper('inputTip', Vine.InputTipView);