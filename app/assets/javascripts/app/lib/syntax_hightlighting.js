Vine.SyntaxHighlighting = {
  apply: function($elem) {
    $('pre code[class]', $elem).each(function(i, e) {
      return $LAB.script("/assets/highlight.pack.js").wait(function() {
        return hljs.highlightBlock(e);
      });
    });
  }
};
