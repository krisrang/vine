module("Vine.User");

test('admin', function(){
  var user = Vine.User.create({id: 1, username: 'eviltrout'});

  ok(!user.get('admin'), "user is not admin");
});


asyncTestVine("findByUsername", function() {
  expect(2);

  Vine.User.findByUsername('kris').then(function (user) {
    present(user);
    equal(user.get('username'), 'kris', 'it has the correct username');
    start();
  });
});