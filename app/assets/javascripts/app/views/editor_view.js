Vine.EditorView = Vine.View.extend({
  elementId: 'editor',
  classNameBindings: ['editorStateClass',
                      'loading',
                      'showPreview',
                      'hidePreview'],

  model: Em.computed.alias('controller.model'),

  hidePreview: Em.computed.not('showPreview'),

  click: function() {
    this.get('controller').openIfDraft();
  },

  editorStateClass: function() {
    var state = this.get('controller.editorState');
    if (state) return state;
    return Vine.EditorController.CLOSED;
  }.property('controller.editorState'),

  draftStatus: function() {
    var $reply = $('#wmd-input');

    if ($reply.is(':focus')) {
      var replyDiff = this.get('missingReplyCharacters');
      if (replyDiff > 0) {
        return I18n.t('editor.min_length.need_more_for_reply', { n: replyDiff });
      }
    }

    // hide the counters if the currently focused text field is OK
    return "";

  }.property('missingReplyCharacters'),

  missingReplyCharacters: function() {
    return this.get('minimumMessageLength') - this.get('model.replyLength');
  }.property('minimumMessageLength', 'model.replyLength'),

  minimumMessageLength: function() {
    return Vine.SiteSettings.min_message_length;
  }.property(),

  didInsertElement: function() {
    var val = (Vine.Mobile.mobileView ? false : (Vine.KeyValueStore.get('editor.showPreview') || 'true'));
    this.set('showPreview', val === 'true');
    this.set('controller.editorState', Vine.EditorController.CLOSED);

    var $editor = $('#editor');
    $editor.DivResizer({resize: this.resize});
  },

  childDidInsertElement: function(e) {
    return this.initEditor();
  },

  resize: function() {
    // this still needs to wait on animations, need a clean way to do that
    return Em.run.schedule('afterRender', function() {
      var editor = $('#editor');
      var h = editor.height() || 0;
      var sizePx = "" + h + "px";
      $('#messages').css('padding-bottom', sizePx);
    });
  }.observes('controller.editorState'),

  cantSubmitMessage: function() {
    // Can't submit while loading
    if (this.get('loading')) return true;

    // reply is always required
    if (this.get('missingReplyCharacters') > 0) return true;

    return false;
  }.property('loading', 'model.replyLength', 'missingReplyCharacters'),

  // The text for the save button
  saveText: function() {
    switch (this.get('model.action')) {
      case EDIT: return I18n.t('editor.save_edit');
      case REPLY: return I18n.t('editor.reply');
    }
  }.property('action'),

  togglePreview: function() {
    this.toggleProperty('showPreview');
    Vine.KeyValueStore.set({ key: 'editor.showPreview', value: this.get('showPreview') });
  },

  toggleText: function() {
    return this.get('showPreview') ? I18n.t('editor.hide_preview') : I18n.t('editor.show_preview');
  }.property('showPreview'),

  // Disable fields when we're loading
  loadingChanged: function() {
    if (this.get('loading')) {
      $('#wmd-input').prop('disabled', 'disabled');
    } else {
      $('#wmd-input').prop('disabled', '');
    }
  }.observes('loading'),

  initEditor: function() {
    var $wmdInput, editor, editorView = this;
    this.wmdInput = $wmdInput = $('#wmd-input');
    if ($wmdInput.length === 0 || $wmdInput.data('init') === true) return;

    $LAB.script(assetPath('sanitizer-bundle'));
    // Vine.ComposerView.trigger("initWmdEditor");
    // var template = Vine.UserSelector.templateFunction();

    $wmdInput.data('init', true);
    // $wmdInput.autocomplete({
    //   template: template,
    //   dataSource: function(term) {
    //     return Vine.UserSearch.search({
    //       term: term,
    //       topicId: composerView.get('controller.controllers.topic.model.id')
    //     });
    //   },
    //   key: "@",
    //   transformComplete: function(v) { return v.username; }
    // });

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

    // I hate to use Em.run.later, but I don't think there's a way of waiting for a CSS transition to finish
    return Em.run.later(jQuery, (function() {
      editorView.resize();
      return $wmdInput.putCursorAtEnd();
    }), 300);
  },

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
  }.observes('model.reply', 'hidePreview'),  

  afterRender: Vine.debounce(function() {
    var $wmdPreview = $('#wmd-preview');
    if ($wmdPreview.length === 0) return;

    // Discourse.SyntaxHighlighting.apply($wmdPreview);

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

