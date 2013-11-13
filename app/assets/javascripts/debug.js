// Ember.LOG_BINDINGS = true;
Ember.ENV.RAISE_ON_DEPRECATION = true;
Ember.LOG_STACKTRACE_ON_DEPRECATION = true;

// Ember.onerror = function(error) {
//   Em.$.ajax('/error-notification', 'POST', {
//     stack: error.stack,
//     otherInformation: 'exception message'
//   });
// }

Ember.RSVP.configure('onerror', function(error) {
  Ember.Logger.assert(false, error);
});