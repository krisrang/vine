Vine.StaticController = Vine.Controller.extend({
  path: null,
  
  loadPath: function(path) {
    var self = this;

    this.setProperties({
      path: path,
      contents: null
    });

    // Load from <noscript> if we have it.
    var $preloaded = $("noscript[data-path=\"" + path + "\"]");
    if ($preloaded.length) {
      var text = $preloaded.text();
      text = text.match(/<!--preload-content:-->((?:.|[\n\r])*)<!--:preload-content-->/)[1];
      this.set('contents', text);
    } else {
      return Vine.ajax(path, {dataType: 'html'}).then(function (result) {
        self.set('contents', result);
      });
    }
  }
});

Vine.StaticController.reopenClass({
  pages: ['login'],
  configs: {}
});