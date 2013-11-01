module("Vine.HasCurrentUser", {
  setup: function() {
    sinon.stub(Vine.User, "current");
  },

  teardown: function() {
    Vine.User.current.restore();
  }
});

test("adds `currentUser` property to an object and ensures it is not cached", function() {
  var testObj = Ember.Object.createWithMixins(Vine.HasCurrentUser, {});

  Vine.User.current.returns("first user");
  equal(testObj.get("currentUser"), "first user", "on the first call property returns initial user");

  Vine.User.current.returns("second user");
  equal(testObj.get("currentUser"), "second user", "if the user changes, on the second call property returns changed user");
});
