module("Vine.Model");

test("mixes in Vine.Presence", function() {
  ok(Vine.Presence.detect(Vine.Model.create()));
});