Vine.StaticController = Vine.Controller.extend({
  loadPath: function(path) {
    var staticController = this;
    this.set('content', null);

    // Load from <noscript> if we have it.
    var $preloaded = $("noscript[data-path=\"" + path + "\"]");
    if ($preloaded.length) {
      var text = $preloaded.text();
      text = text.match(/<!--preload-content:-->((?:.|[\n\r])*)<!--:preload-content-->/);
      text = text[1];
      this.set('content', text);
    } else {
      return Vine.ajax(path, {dataType: 'html'}).then(function (result) {
        staticController.set('content', result);
      });
    }
  }
});

Vine.StaticController.reopenClass({
  pages: ['login'],
  configs: {}
});