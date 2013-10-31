function integration(name) {
  module("Integration: " + name, {
    setup: function() {
      // sinon.stub(Vine.ScrollingDOMMethods, "bindOnScroll");
      // sinon.stub(Vine.ScrollingDOMMethods, "unbindOnScroll");
      Ember.run(Vine, Vine.advanceReadiness);
    },

    teardown: function() {
      Vine.reset();
      // Vine.ScrollingDOMMethods.bindOnScroll.restore();
      // Vine.ScrollingDOMMethods.unbindOnScroll.restore();
    }
  });
}

function testController(klass, model) {
  return klass.create({model: model, container: Vine.__container__});
}

function controllerFor(controller, model) {
  var controller = Vine.__container__.lookup('controller:' + controller);
  if (model) { controller.set('model', model ); }
  return controller;
}

function asyncTestVine(text, func) {
  asyncTest(text, function () {
    var self = this;
    Ember.run(function () {
      func.call(self);
    });
  });
}