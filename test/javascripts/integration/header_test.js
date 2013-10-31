integration("Header");

test("/", function() {

  visit("/").then(function() {
    expect(1);

    ok(exists("nav.navbar"), "The header was rendered");
  });
});
