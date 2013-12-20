Vine.QuoteButtonController = Vine.Controller.extend({
  needs: ['editor'],

  init: function() {
    this._super();
    $LAB.script(assetPath('sanitizer-bundle'));
  },

  /**
    If the buffer is cleared, clear out other state (post)
  **/
  bufferChanged: function() {
    if (this.blank('buffer')) this.set('message', null);
  }.observes('buffer'),

  /**
    Save the currently selected text and displays the
    "quote reply" button

    @method selectText
  **/
  selectText: function(messageId) {
    // anonymous users cannot "quote-reply"
    if (!this.get('currentUser.isSignedIn')) return;

    // don't display the "quote-reply" button if we can't create a post
    // if (!this.get('controllers.topic.model.details.can_create_post')) return;

    var selection = window.getSelection();
    // no selections
    if (selection.rangeCount === 0) return;

    // retrieve the selected range
    var range = selection.getRangeAt(0),
        cloned = range.cloneRange(),
        $ancestor = $(range.commonAncestorContainer);

    // don't display the "quote reply" button if you select text spanning two posts
    // note: the ".contents" is here to prevent selection of the topic summary
    // if ($ancestor.closest('.topic-body > .contents').length === 0) {
    //   this.set('buffer', '');
    //   return;
    // }

    var selectedText = Vine.Utilities.selectedText();
    if (this.get('buffer') === selectedText) return;

    var quoteButtonController = this;

    this.get('store').find('message', messageId).then(
      function(message) {
        quoteButtonController.set('message', message);
      }
    );

    this.set('buffer', selectedText);

    // collapse the range at the beginning of the selection
    // (ie. moves the end point to the start point)
    range.collapse(true);

    // create a marker element
    var markerElement = document.createElement("span");
    // containing a single invisible character
    markerElement.appendChild(document.createTextNode("\ufeff"));
    // and insert it at the beginning of our selection range
    range.insertNode(markerElement);

    // retrieve the position of the market
    var markerOffset = $(markerElement).offset(),
        $quoteButton = $('.quote-button');

    // remove the marker
    markerElement.parentNode.removeChild(markerElement);

    // work around Chrome that would sometimes lose the selection
    var sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(cloned);

    // move the quote button above the marker
    Em.run.schedule('afterRender', function() {
      $quoteButton.offset({
        top: markerOffset.top - $quoteButton.outerHeight() - 5,
        left: markerOffset.left
      });
    });
  },

  /**
    Quote the currently selected text

    @method quoteText
  **/
  quoteText: function() {
    var message = this.get('message');
    var editorController = this.get('controllers.editor');

    var buffer = this.get('buffer');
    var quotedText = Vine.Quote.build(message, buffer);

    if (editorController.get('model.replyDirty')) {
      editorController.appendText(quotedText);
    } else {
      editorController.newMessage().then(function() {
        editorController.appendText(quotedText);
      });
    }
    this.set('buffer', '');
    return false;
  },

  /**
    Deselect the currently selected text

    @method deselectText
  **/
  deselectText: function() {
    // clear selected text
    window.getSelection().removeAllRanges();
    // clean up the buffer
    this.set('buffer', '');
  }

});
