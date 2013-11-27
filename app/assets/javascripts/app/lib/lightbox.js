/**
  Helper object for lightboxes.

  @class Lightbox
  @namespace Discourse
  @module Discourse
**/
Vine.Lightbox = {
  apply: function($elem) {
    $LAB.script(assetPath("jquery.magnific")).wait(function() {
      $('a.lightbox', $elem).each(function(i, e) {
        $(e).magnificPopup({ type: 'image', closeOnContentClick: true });
      });
    });
  }
};
