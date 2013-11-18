/*jshint maxlen:250 */
/*global count:true find:true document:true equal:true sinon:true */

//= require locales/en
//= require preload_store
//= require application

//= require sinon
//= require sinon-qunit
//= require jshint

//= require helpers/qunit_helpers
//= require helpers/assertions

//= require_tree ./fixtures
//= require_tree .
//= require_self
//= require jshint_all

sinon.config = {
  injectIntoThis: true,
  injectInto: null,
  properties: ["spy", "stub", "mock", "clock", "sandbox"],
  useFakeTimers: false,
  useFakeServer: false
};

window.assetPath = function() { return null; };

var oldAjax = $.ajax;
$.ajax = function() {
  try {
    this.undef();
  } catch(e) {
    console.error("Vine.Ajax called in test environment (" + arguments[0] + ")\n caller: " + e.stack.split("\n").slice(2).join("\n"));
  }
  return oldAjax.apply(this, arguments);
};

var d = document;
d.write('<div id="qunit-scratch" style="display:none"></div>');
d.write('<div id="ember-testing-container"><div id="ember-testing"></div></div>');
d.write('<style>#ember-testing-container { position: absolute; background: white; bottom: 0; right: 0; width: 640px; height: 384px; overflow: auto; z-index: 9999; border: 1px solid #ccc; } #ember-testing { zoom: 50%; }</style>');

Vine.rootElement = '#ember-testing';
Vine.setupForTesting();
Vine.injectTestHelpers();

QUnit.testStart(function() {
  // Allow our tests to change site settings and have them reset before the next test
  Vine.SiteSettings = jQuery.extend(true, {}, Vine.SiteSettingsOriginal);
});
