/**
  Breaks up a long string

  @method breakUp
  @for Handlebars
**/
Handlebars.registerHelper('breakUp', function(property, options) {
  var prop, result, tokens;
  prop = Ember.Handlebars.get(this, property, options);
  if (!prop) return "";

  return Vine.Formatter.breakUp(prop, 13);
});

/**
  Truncates long strings

  @method shorten
  @for Handlebars
**/
Handlebars.registerHelper('shorten', function(property, options) {
  return Ember.Handlebars.get(this, property, options).substring(0,35);
});

/**
  Display a property in lower case

  @method lower
  @for Handlebars
**/
Handlebars.registerHelper('lower', function(property, options) {
  var o;
  o = Ember.Handlebars.get(this, property, options);
  if (o && typeof o === 'string') {
    return o.toLowerCase();
  } else {
    return "";
  }
});

/**
  Nicely format a date without a binding since the date doesn't need to change.

  @method unboundDate
  @for Handlebars
**/
Handlebars.registerHelper('unboundDate', function(property, options) {
  var dt = new Date(Ember.Handlebars.get(this, property, options));
  return Vine.Formatter.longDate(dt);
});

/**
  Live refreshing age helper

  @method unboundDate
  @for Handlebars
**/
Handlebars.registerHelper('unboundAge', function(property, options) {
  var dt = new Date(Ember.Handlebars.get(this, property, options));
  return new Handlebars.SafeString(Vine.Formatter.autoUpdatingRelativeAge(dt));
});

/**
  Live refreshing age helper, with a tooltip showing the date and time

  @method unboundAgeWithTooltip
  @for Handlebars
**/
Handlebars.registerHelper('unboundAgeWithTooltip', function(property, options) {
  var dt = new Date(Ember.Handlebars.get(this, property, options));
  return new Handlebars.SafeString(Vine.Formatter.autoUpdatingRelativeAge(dt, {title: true}));
});

/**
  Displays a float nicely

  @method float
  @for Ember.Handlebars
**/
Ember.Handlebars.registerHelper('float', function(property, options) {
  var x = Ember.Handlebars.get(this, property, options);
  if (!x) return "0";
  if (Math.round(x) === x) return x;
  return x.toFixed(3);
});

/**
  Display logic for numbers.

  @method number
  @for Handlebars
**/
Handlebars.registerHelper('number', function(property, options) {
  var n, orig, title, result;
  orig = parseInt(Ember.Handlebars.get(this, property, options), 10);
  if (isNaN(orig)) {
    orig = 0;
  }
  title = orig;
  if (options.hash.numberKey) {
    title = I18n.t(options.hash.numberKey, {
      number: orig
    });
  }
  // Round off the thousands to one decimal place
  n = orig;
  if (orig > 999 && !options.hash.noTitle) {
    n = (orig / 1000).toFixed(1) + "K";
  }

  result = "<span class='number'";

  if(n !== title) {
    result += " title='" + title + "'";
  }

  result += ">" + n + "</span>";
  return new Handlebars.SafeString(result);
});

/**
  Display logic for dates.

  @method date
  @for Handlebars
**/
Handlebars.registerHelper('date', function(property, options) {
  var leaveAgo;
  if (property.hash) {
    if (property.hash.leaveAgo) {
      leaveAgo = property.hash.leaveAgo === "true";
    }
    if (property.hash.path) {
      property = property.hash.path;
    }
  }
  var val = Ember.Handlebars.get(this, property, options);
  if (val) {
    var date = new Date(val);
    return new Handlebars.SafeString(Vine.Formatter.autoUpdatingRelativeAge(date, {format: 'medium', title: true, leaveAgo: leaveAgo}));
  }

});
