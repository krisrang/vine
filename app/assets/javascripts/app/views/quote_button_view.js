Vine.QuoteButtonView = Vine.View.extend({
  classNames: ['quote-button'],
  classNameBindings: ['visible'],
  isMouseDown: false,
  isTouchInProgress: false,

  visible: Em.computed.notEmpty('controller.buffer'),

  render: function(buffer) {
    buffer.push('<i class="fa fa-quote-right"></i>&nbsp;&nbsp;');
    buffer.push(I18n.t("message.quote_reply"));
  },

  /**
    Binds to the following global events:
      - `mousedown` to clear the quote button if they click elsewhere.
      - `mouseup` to trigger the display of the quote button.
      - `selectionchange` to make the selection work under iOS
  **/
  didInsertElement: function() {
    var controller = this.get('controller'),
        view = this;

    $(document)
      .on("mousedown.quote-button", function(e) {
        view.set('isMouseDown', true);
        // we don't want to deselect when we click on the quote button or the reply button
        if ($(e.target).hasClass('quote-button') || $(e.target).closest('.create').length > 0) return;
        // deselects only when the user left click
        // (allows anyone to `extend` their selection using shift+click)
        if (e.which === 1 && !e.shiftKey) controller.deselectText();
      })
      .on('mouseup.quote-button', function(e) {
        view.selectText(e.target, controller);
        view.set('isMouseDown', false);
      })
      .on('touchstart.quote-button', function(e){
        view.set('isTouchInProgress', true);
      })
      .on('touchend.quote-button', function(e){
        view.set('isTouchInProgress', false);
      })
      .on('selectionchange', function() {
        // there is no need to handle this event when the mouse is down
        // or if there a touch in progress
        if (view.get('isMouseDown') || view.get('isTouchInProgress')) return;
        // `selection.anchorNode` is used as a target
        view.selectText(window.getSelection().anchorNode, controller);
      });
  },

  selectText: function(target, controller) {
    var $target = $(target);
    // retrieve the post id from the DOM
    var messageId = $target.closest('.message').data('message-id');
    // select the text
    if (messageId) controller.selectText(messageId);
  },

  willDestroyElement: function() {
    $(document)
      .off("mousedown.quote-button")
      .off("mouseup.quote-button")
      .off("touchstart.quote-button")
      .off("touchend.quote-button")
      .off("selectionchange");
  },

  click: function(e) {
    e.stopPropagation();
    return this.get('controller').quoteText(e);
  }
});
