/**
  markdown-js doesn't ensure that em/strong codes are present on word boundaries.
  So we create our own handlers here.
**/

// Support for simultaneous bold and italics
Vine.Dialect.inlineBetween({
  between: '***',
  wordBoundary: true,
  emitter: function(contents) { return ['strong', ['em'].concat(contents)]; }
});

Vine.Dialect.inlineBetween({
  between: '___',
  wordBoundary: true,
  emitter: function(contents) { return ['strong', ['em'].concat(contents)]; }
});

// Builds a common markdown replacer
var replaceMarkdown = function(match, tag) {
  Vine.Dialect.inlineBetween({
    between: match,
    wordBoundary: true,
    emitter: function(contents) { return [tag].concat(contents) }
  });
};

replaceMarkdown('**', 'strong');
replaceMarkdown('__', 'strong');
replaceMarkdown('*', 'em');
replaceMarkdown('_', 'em');

replaceMarkdown('~~', 'del');