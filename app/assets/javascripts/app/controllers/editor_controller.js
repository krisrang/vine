Vine.EditorController = Vine.Controller.extend({
  needs: ['modal'],

  actions: {
    // Toggle the reply view
    toggle: function() {
      this.toggle();
    },

    togglePreview: function() {
      this.get('model').togglePreview();
    },

    // Import a quote from the post
    importQuote: function() {
      this.get('model').importQuote();
    },

    cancel: function() {
      this.cancelEditor();
    },

    save: function() {
      this.save();
    }
  },

  open: function(opts) {
    if (!opts) opts = {};

    var promise = opts.promise || Ember.Deferred.create();
    opts.promise = promise;

    var editorController = this;
    var editor = this.get('model');
    if (editor && editor.editorState === Vine.Editor.DRAFT) {
      this.close();
      editor = null;
    }

    if (editor && !opts.tested && editor.get('replyDirty')) {
      if (editor.editorState === Vine.Editor.DRAFT && editor.action === opts.action) {
        editor.set('editorState', Vine.Editor.OPEN);
        promise.resolve();
        return promise;
      } else {
        opts.tested = true;
        if (!opts.ignoreIfChanged) {
          this.cancelEditor().then(
            function() { editorController.open(opts); },
            function() { return promise.reject(); }
          );
        }
        return promise;
      }
    }

    if (opts.draft) {
      editor = Vine.Editor.loadDraft(opts.draft);
    }

    editor = editor || Vine.Editor.create();
    editor.open(opts);

    this.set('model', editor);
    editor.set('editorState', Vine.Editor.OPEN);
    promise.resolve();
    return promise;
  },

  openIfDraft: function() {
    if (this.get('model.viewDraft')) {
      this.set('model.editorState', Vine.Editor.OPEN);
    }
  },

  saveDraft: function() {
    var model = this.get('model');
    if (model) { model.saveDraft(this.store.createRecord('draft')); }
  },

  updateDraftStatus: function() {
    this.get('model').updateDraftStatus();
  },

  // save: function(){

  // },

  cancelEditor: function(){
    var editorController = this;

    return Ember.Deferred.promise(function (promise) {
      if (editorController.get('model.replyDirty')) {
        bootbox.confirm(I18n.t("message.abandon"), function(result) {
          if (result) {
            editorController.destroyDraft();
            editorController.get('model').clearState();
            editorController.close();
            promise.resolve();
          } else {
            promise.reject();
          }
        });
      } else {
        // it is possible there is some sort of crazy draft with no body ... just give up on it
        editorController.destroyDraft();
        editorController.close();
        promise.resolve();
      }
    });
  },

  destroyDraft: function() {
    Vine.Draft.clear();
  },

  shrink: function() {
    if (this.get('model.replyDirty')) {
      this.collapse();
    } else {
      this.close();
    }
  },

  collapse: function() {
    this.saveDraft();
    this.set('model.editorState', Vine.Editor.DRAFT);
  },

  close: function() {
    this.set('model', null);
  },

  toggle: function() {
    // this.closeAutocomplete();
    switch (this.get('model.editorState')) {
      case Vine.Editor.OPEN:
        if (this.blank('model.reply')) {
          this.close();
        } else {
          this.shrink();
        }
        break;
      case Vine.Editor.DRAFT:
        this.set('model.editorState', Vine.Editor.OPEN);
        break;
      case Vine.Editor.SAVING:
        this.close();
    }
    return false;
  }
});