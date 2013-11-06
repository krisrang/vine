/**
  Supports Vine's custom @mention syntax for calling out a user in a post.
  It will add a special class to them, and create a link if the user is found in a
  local map.
**/
Vine.Dialect.inlineRegexp({
  start: '@',
  matcher: /^(@[A-Za-z0-9][A-Za-z0-9_]{2,14})/m,
  wordBoundary: true,

  emitter: function(matches) {
    var username = matches[1],
        mentionLookup = this.dialect.options.mentionLookup || Vine.Mention.lookupCache;

    if (mentionLookup(username.substr(1))) {
      return ['a', {'class': 'mention', href: Vine.getURL("/users/") + username.substr(1).toLowerCase()}, username];
    } else {
      return ['span', {'class': 'mention'}, username];
    }
  }
});

