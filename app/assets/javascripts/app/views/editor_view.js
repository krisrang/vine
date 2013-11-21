Vine.EditorView = Vine.View.extend({
  elementId: 'editor',
  classNameBindings: ['editorStateClass',
                      'controller.createdMessage',
                      'model.loading',
                      'model.showPreview',
                      'model.hidePreview'],

  model: Em.computed.alias('controller.model'),

  click: function() {
    this.get('controller').openIfDraft();
  },

  editorStateClass: function() {
    var state = this.get('controller.editorState');
    if (state) return state;
    return Vine.EditorController.CLOSED;
  }.property('controller.editorState'),

  didInsertElement: function() {
    var $editor = $('#editor');
    $editor.DivResizer({resize: this.resize});
  },

  childDidInsertElement: function(e) {
    return this.initEditor();
  },

  resize: function() {
    return Em.run.later(jQuery, (function() {
      var editor = $('#editor');
      var h = editor.height() || 0;
      var sizePx = "" + h + "px";
      $('#messages').css('padding-bottom', sizePx);
    }), 300);
  }.observes('controller.editorState'),  

  // Disable fields when we're loading
  loadingChanged: function() {
    if (this.get('model.loading')) {
      $('#wmd-input').prop('disabled', 'disabled');
    } else {
      $('#wmd-input').prop('disabled', '');
    }
  }.observes('model.loading'),

  focusIn: function() {
    var model = this.get('model');
    if (model) model.updateDraftStatus();
  },

  initEditor: function() {
    var $wmdInput, editor, editorView = this;
    this.wmdInput = $wmdInput = $('#wmd-input');
    if ($wmdInput.length === 0 || $wmdInput.data('init') === true) return;

    $LAB.script(assetPath('sanitizer-bundle'));
    Vine.EditorView.trigger("initWmdEditor");
    $wmdInput.data('init', true);

    this.editor = editor = Vine.Markdown.createEditor({});

    this.editor.hooks.onPreviewRefresh = function() {
      return editorView.afterRender();
    };

    this.editor.run();
    this.set('editor', this.editor);
    this.loadingChanged();

    var saveDraft = Vine.debounce((function() {
      return editorView.get('controller').saveDraft();
    }), 2000);

    $wmdInput.keyup(function() {
      saveDraft();
      return true;
    });

    $('#wmd-quote-post').click(function(e) {
      editorView.get('model').importQuote();
      e.preventDefault();
      e.stopPropagation();
    });

    // I hate to use Em.run.later, but I don't think there's a way of waiting for a CSS transition to finish
    return Em.run.later(jQuery, (function() {
      editor.refreshPreview(); // loaded draft
      editorView.resize();
      return $wmdInput.putCursorAtEnd();
    }), 300);
  },

  observeQuoting: function() {
    var model = this.get('model');
    return Em.run.schedule("afterRender", (function() {
      var $btn = $('#wmd-quote-post');
      if ($btn.length === 0) return;

      if (model.get('message') && model.get('action') === Vine.Draft.REPLY) {
        $btn.show();
      } else {
        $btn.hide();
      }
    }));
  }.observes('model.message'),

  observeReplyChanges: function() {
    var self = this;
    if (this.get('model.hidePreview')) return;
    Ember.run.next(function() {
      if (self.editor) {
        self.editor.refreshPreview();

        // if the caret is on the last line ensure preview scrolled to bottom
        var caretPosition = Vine.Utilities.caretPosition(self.wmdInput[0]);
        if (!self.wmdInput.val().substring(caretPosition).match(/\n/)) {
          var $wmdPreview = $('#wmd-preview');
          if ($wmdPreview.is(':visible')) {
            $wmdPreview.scrollTop($wmdPreview[0].scrollHeight);
          }
        }
      }
    });
  }.observes('model.reply', 'model.hidePreview'),  

  afterRender: Vine.debounce(function() {
    var $wmdPreview = $('#wmd-preview');
    if ($wmdPreview.length === 0) return;

    Vine.SyntaxHighlighting.apply($wmdPreview);

    this.trigger('previewRefreshed', $wmdPreview);
  }, 100)
});

Vine.NotifyingTextArea = Ember.TextArea.extend({
  placeholder: function() {
    return I18n.t(this.get('placeholderKey'));
  }.property('placeholderKey'),

  didInsertElement: function() {
    return this.get('parent').childDidInsertElement(this);
  }
});

RSVP.EventTarget.mixin(Vine.EditorView);