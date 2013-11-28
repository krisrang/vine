Vine.MessageView = Vine.View.extend({
  tagName: 'li',
  classNameBindings: ['idClass', ':message-view'],

  idClass: function() {
    return "message-" + this.get("controller.content.id");
  }.property('controller.content.id'),

  didInsertElement: function() {
    var $message = this.$();

    Vine.SyntaxHighlighting.apply($message);
    Vine.Lightbox.apply($message);

    this.insertQuoteControls();

    $message.addClass('ready');
  },

  insertQuoteControls: function() {
    var messageView = this;

    return this.$('aside.quote').each(function(i, e) {
      var $aside = $(e);
      messageView.updateQuoteElements($aside, 'chevron-down');
      var $title = $('.title', $aside);

      // Unless it's a full quote, allow click to expand
      if (!($aside.data('full') || $title.data('has-quote-controls'))) {
        $title.on('click', function(e) {
          if ($(e.target).is('a')) return true;
          messageView.toggleQuote($aside);
        });
        $title.data('has-quote-controls', true);
      }
    });
  },

  updateQuoteElements: function($aside, desc) {
    // Only add the expand/contract control if it's not a full message
    var expandContract = "";
    if (!$aside.data('full')) {
      expandContract = "<i class='fa fa-" + desc + "' title='" + I18n.t("message.expand_collapse") + "'></i>";
      $aside.css('cursor', 'pointer');
    }

    $('.quote-controls', $aside).html("" + expandContract);
  },

  toggleQuote: function($aside) {
    $aside.data('expanded',!$aside.data('expanded'));

    if ($aside.data('expanded')) {
      this.updateQuoteElements($aside, 'chevron-up');
      // Show expanded quote
      var $blockQuote = $('blockquote', $aside);
      $aside.data('original-contents',$blockQuote.html());

      var originalText = $blockQuote.text().trim();
      $blockQuote.html(I18n.t("loading"));

      Vine.ajax("/messages/" + $aside.data('message')).then(function (result) {
        var parsed = $(result.message.cooked);
        parsed.replaceText(originalText, "<span class='highlighted'>" + originalText + "</span>");
        $blockQuote.showHtml(parsed);
      });
    } else {
      // Hide expanded quote
      this.updateQuoteElements($aside, 'chevron-down');
      $('blockquote', $aside).showHtml($aside.data('original-contents'));
    }
    return false;
  }
});