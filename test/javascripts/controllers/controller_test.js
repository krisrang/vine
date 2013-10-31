module("Vine.Controller");

test("includes mixins", function() {
  ok(Vine.Presence.detect(Vine.Controller.create()), "Vine.Presence");
  ok(Vine.HasCurrentUser.detect(Vine.Controller.create()), "Vine.HasCurrentUser");
});
