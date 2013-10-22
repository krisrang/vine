Vine.Router.map(function() {
	this.route('login');
});

Vine.Router.reopen({
  location: 'history'
});