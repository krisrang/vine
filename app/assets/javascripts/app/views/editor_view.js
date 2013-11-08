Vine.EditorView = Vine.View.extend({
  elementId: 'editor',
  classNameBindings: ['editorState',
                      'model.loading',
                      'postMade',
                      'model.showPreview',
                      'model.hidePreview'],

  model: Em.computed.alias('controller.model'),

  editorState: function() {
    var state = this.get('model.editorState');
    if (state) return state;
    return Vine.Editor.CLOSED;
  }.property('model.editorState'),

  // Disable fields when we're loading
  loadingChanged: function() {
    if (this.get('loading')) {
      $('#wmd-input').prop('disabled', 'disabled');
    } else {
      $('#wmd-input').prop('disabled', '');
    }
  }.observes('loading'),

  didInsertElement: function() {
    var $editor = $('#editor');
    $editor.DivResizer({});
    // this.get('controller').open({editorState: Vine.Editor.CLOSED});
  },

  childDidInsertElement: function(e) {
    return this.initEditor();
  },

  initEditor: function() {
    var $wmdInput, editor, editorView = this;
    this.wmdInput = $wmdInput = $('#wmd-input');
    if ($wmdInput.length === 0 || $wmdInput.data('init') === true) return;

    // $LAB.script(assetPath('defer/html-sanitizer-bundle'));
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

    // var saveDraft = Vine.debounce((function() {
    //   return composerView.get('controller').saveDraft();
    // }), 2000);

    // $wmdInput.keyup(function() {
    //   saveDraft();
    //   return true;
    // });

    // var $replyTitle = $('#reply-title');

    // $replyTitle.keyup(function() {
    //   saveDraft();
    //   // removes the red background once the requirements are met
    //   if (composerView.get('model.missingTitleCharacters') <= 0) {
    //     $replyTitle.removeClass("requirements-not-met");
    //   }
    //   return true;
    // });

    // // when the title field loses the focus...
    // $replyTitle.blur(function(){
    //   // ...and the requirements are not met (ie. the minimum number of characters)
    //   if (composerView.get('model.missingTitleCharacters') > 0) {
    //     // then, "redify" the background
    //     $replyTitle.toggleClass("requirements-not-met", true);
    //   }
    // });

    // // I hate to use Em.run.later, but I don't think there's a way of waiting for a CSS transition
    // // to finish.
    // return Em.run.later(jQuery, (function() {
    //   var replyTitle = $('#reply-title');
    //   composerView.resize();
    //   return replyTitle.length ? replyTitle.putCursorAtEnd() : $wmdInput.putCursorAtEnd();
    // }), 300);
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
  }.observes('model.reply', 'model.hidePreview'),

  afterRender: Vine.debounce(function() {
    var $wmdPreview = $('#wmd-preview');
    if ($wmdPreview.length === 0) return;

    // Discourse.SyntaxHighlighting.apply($wmdPreview);

    var refresh = false;

    // // Load the post processing effects
    // $('a.onebox', $wmdPreview).each(function(i, e) {
    //   Discourse.Onebox.load(e, refresh);
    // });
    // $('span.mention', $wmdPreview).each(function(i, e) {
    //   Discourse.Mention.load(e, refresh);
    // });

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

