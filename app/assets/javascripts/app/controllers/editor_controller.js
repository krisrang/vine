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
      this.cancelComposer();
    },

    save: function() {
      this.save();
    }
  },

  open: function(opts) {
    if (!opts) opts = {};

    var promise = opts.promise || Ember.Deferred.create();
    opts.promise = promise;

    // var composer = this.get('model');
    // if (composer && opts.draftKey !== composer.draftKey && composer.composeState === Discourse.Composer.DRAFT) {
    //   this.close();
    //   composer = null;
    // }

    var editor = Vine.Editor.create();
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