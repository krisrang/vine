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

  ensureMaximumDimensionForImagesInPreview: function() {
    $('<style>#wmd-preview img, .cooked img {' +
      'max-width:' + Vine.SiteSettings.max_image_width + 'px;' +
      'max-height:' + Vine.SiteSettings.max_image_height + 'px;' +
      '}</style>'
     ).appendTo('head');
  },

  didInsertElement: function() {
    var $editor = $('#editor');
    $editor.DivResizer({resize: this.resize});
    this.ensureMaximumDimensionForImagesInPreview();
    this.setupHotkeys();
  },

  childDidInsertElement: function(e) {
    return this.initEditor();
  },

  willDestroyElement: function(e) {
    Mousetrap.reset();
  },

  setupHotkeys: function() {
    var controller = this.get('controller');

    Mousetrap.bind('mod+s', function(e) {
      controller.save();
      return false; // stop bubbling
    });

    // only accept shortcuts when we're in the editor input
    Mousetrap.stopCallback = function(e, element, combo) {
      // if the element has the class "mousetrap" then no need to stop
      if ((' ' + element.className + ' ').indexOf(' mousetrap ') > -1) {
          return false;
      }

      if (combo === "mod+s") { return true; }

      // stop for input, select, and textarea
      return element.tagName == 'INPUT' || element.tagName == 'SELECT' || element.tagName == 'TEXTAREA' || (element.contentEditable && element.contentEditable == 'true');
    }
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

    var $uploadTarget = $('#editor');
    this.editor.hooks.insertImageDialog = function(callback) {
      callback(null);
      editorView.get('controller').send('showUploadSelector', editorView);
      return true;
    };

    this.editor.hooks.onPreviewRefresh = function() {
      return editorView.afterRender();
    };

    var behaveEditor = new Behave({
        textarea: document.getElementById('wmd-input')
    });

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

    // In case it's still bound somehow
    // $uploadTarget.fileupload('destroy');
    $uploadTarget.off();

    $uploadTarget.fileupload({
        url: '/uploads',
        dataType: 'json'
    });

    // submit - this event is triggered for each upload
    $uploadTarget.on('fileuploadsubmit', function (e, data) {
      var result = Vine.Utilities.validateUploadedFiles(data.files);
      // reset upload status when everything is ok
      if (result) editorView.setProperties({ uploadProgress: 0, isUploading: true });
      return result;
    });

    // send - this event is triggered when the upload request is about to start
    $uploadTarget.on('fileuploadsend', function (e, data) {
      // hide the "file selector" modal
      editorView.get('controller').send('closeModal');
      // cf. https://github.com/blueimp/jQuery-File-Upload/wiki/API#how-to-cancel-an-upload
      var jqXHR = data.xhr();
      // need to wait for the link to show up in the DOM
      Em.run.schedule('afterRender', function() {
        // bind on the click event on the cancel link
        $('#cancel-file-upload').on('click', function() {
          // cancel the upload
          // NOTE: this will trigger a 'fileuploadfail' event with status = 0
          if (jqXHR) jqXHR.abort();
          // unbind
          $(this).off('click');
        });
      });
    });

    // progress all
    $uploadTarget.on('fileuploadprogressall', function (e, data) {
      var progress = parseInt(data.loaded / data.total * 100, 10);
      editorView.set('uploadProgress', progress);
    });

    // done
    $uploadTarget.on('fileuploaddone', function (e, data) {
      // make sure we have a url
      if (data.result.url) {
        var markdown = Vine.Utilities.getUploadMarkdown(data.result);
        // appends a space at the end of the inserted markdown
        editorView.addMarkdown(markdown + " ");
        editorView.set('isUploading', false);
      } else {
        bootbox.alert(I18n.t('message.errors.upload'));
      }
    });

    // fail
    $uploadTarget.on('fileuploadfail', function (e, data) {
      // hide upload status
      editorView.set('isUploading', false);
      // display an error message
      Vine.Utilities.displayErrorForUpload(data);
    });

    // I hate to use Em.run.later, but I don't think there's a way of waiting for a CSS transition to finish
    return Em.run.later(jQuery, (function() {
      editor.refreshPreview(); // loaded draft
      editorView.resize();
      return $wmdInput.putCursorAtEnd();
    }), 300);
  },

  addMarkdown: function(text) {
    var ctrl = $('#wmd-input').get(0),
        caretPosition = Vine.Utilities.caretPosition(ctrl),
        current = this.get('model.reply');
    this.set('model.reply', current.substring(0, caretPosition) + text + current.substring(caretPosition, current.length));

    Em.run.schedule('afterRender', function() {
      Vine.Utilities.setCaretPosition(ctrl, caretPosition + text.length);
    });
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

    var message = this.get('model.message'),
        refresh = false;

    // If we are editing a post, we'll refresh its contents once. This is a feature that
    // allows a user to refresh its contents once.
    if (message && Em.isEmpty(message.get('refreshedMessage'))) {
      refresh = true;
      message.set('refreshedMessage', true);
    }

    $('a.onebox', $wmdPreview).each(function(i, e) {
      Vine.Onebox.load(e, refresh);
    });

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