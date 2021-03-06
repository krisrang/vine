Vine.Ajax = Em.Mixin.create({

  ajax: function() {
    var url, args;

    if (arguments.length === 1) {
      if (typeof arguments[0] === "string") {
        url = arguments[0];
        args = {};
      } else {
        args = arguments[0];
        url = args.url;
        delete args.url;
      }
    } else if (arguments.length === 2) {
      url = arguments[0];
      args = arguments[1];
    }

    if (args.success) {
      console.warning("DEPRECATION: Vine.ajax should use promises, received 'success' callback");
    }
    if (args.error) {
      console.warning("DEPRECATION: Vine.ajax should use promises, received 'error' callback");
    }

    // If we have URL_FIXTURES, load from there instead (testing)
    var fixture = Vine.URL_FIXTURES && Vine.URL_FIXTURES[url];
    if (fixture) {
      return Ember.RSVP.resolve(fixture);
    }

    var performAjax = function(promise) {
      var oldSuccess = args.success;
      args.success = function(xhr) {
        Ember.run(promise, promise.resolve, xhr);
        if (oldSuccess) oldSuccess(xhr);
      };

      var oldError = args.error;
      args.error = function(xhr) {

        // note: for bad CSRF we don't loop an extra request right away.
        //  this allows us to eliminate the possibility of having a loop.
        if (xhr.status === 403 && xhr.responseText === "['BAD CSRF']") {
          Vine.csrfToken = null;
        }

        // If it's a parseerror, don't reject
        if (xhr.status === 200) return args.success(xhr);

        promise.reject(xhr);
        if (oldError) oldError(xhr);
      };

      // We default to JSON on GET. If we don't, sometimes if the server doesn't return the proper header
      // it will not be parsed as an object.
      if (!args.type) args.type = 'GET';
      if ((!args.dataType) && (args.type === 'GET')) args.dataType = 'json';

      $.ajax(url, args);
    };

    // For cached pages we strip out CSRF tokens, need to round trip to server prior to sending the
    //  request (bypass for GET, not needed)
    if(args.type && args.type !== 'GET' && !Vine.csrfToken){
      return Ember.Deferred.promise(function(promise){
        $.ajax('/session/csrf')
           .success(function(result){
              Vine.csrfToken = result.csrf;
              performAjax(promise);
           });
      });
    } else {
      return Ember.Deferred.promise(performAjax);
    }
  }
});