Vine.debounce = function(func, wait) {
  var timeout = null;

  return function() {
    var context = this;
    var args = arguments;

    var later = function() {
      timeout = null;
      return func.apply(context, args);
    };

    if (timeout) return;

    var currentWait;
    if (typeof wait === "function") {
      currentWait = wait();
    } else {
      currentWait = wait;
    }

    if (timeout) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(later, currentWait);
    return timeout;
  };
};

Vine.debouncePromise = function(func, wait) {
  var timeout = null;
  var args = null;
  var context = null;

  return function() {
    context = this;
    var promise = Ember.Deferred.create();
    args = arguments;

    if (!timeout) {
      timeout = Em.run.later(function () {
        timeout = null;
        func.apply(context, args).then(function (y) {
          promise.resolve(y);
        });
      }, wait);
    }

    return promise;
  };
};

