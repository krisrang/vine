/**
  Support for quoting other users.
**/
Vine.Dialect.replaceBlock({
  start: new RegExp("\\[quote=?([^\\[\\]]+)?\\]([\\s\\S]*)", "igm"),
  stop: '[/quote]',
  emitter: function(blockContents, matches, options) {

    var params = {'class': 'quote'},
        username;

    if (matches[1]) {
      var paramsString = matches[1].replace(/\"/g, ''),
          paramsSplit = paramsString.split(/\, */);

      username = paramsSplit[0];

      paramsSplit.forEach(function(p,i) {
        if (i > 0) {
          var assignment = p.split(':');
          if (assignment[0] && assignment[1]) {
            params['data-' + assignment[0]] = assignment[1].trim();
          }
        }
      });
    }

    var contents = ['blockquote'];
    if (blockContents.length) {
      var self = this;
      blockContents.forEach(function (bc) {
        var processed = self.processInline(bc);
        if (processed.length) {
          contents.push(['p'].concat(processed));
        }
      });
    }

    // If there's no username just return a simple quote
    if (!username) {
      return ['p', ['aside', params, contents ]];
    }

    return ['p', ['aside', params,
                   ['div', {'class': 'title'},
                     username ? I18n.t('user.said', {username: username}) : ""
                   ],
                   contents
                ]];
  }
});

Vine.Dialect.on("parseNode", function(event) {
  var node = event.node,
      path = event.path;

  // Make sure any quotes are followed by a <br>. The formatting looks weird otherwise.
  if (node[0] === 'aside' && node[1] && node[1]['class'] === 'quote') {
    var parent = path[path.length - 1],
        location = parent.indexOf(node)+1,
        trailing = parent.slice(location);

    if (trailing.length) {
      parent.splice(location, 0, ['br']);
    }
  }

});