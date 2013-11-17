var CLOSED = 'closed',
    SAVING = 'saving',
    OPEN = 'open',
    DRAFT = 'draft';


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

  viewOpen: Em.computed.equal('editorState', OPEN),
  viewDraft: Em.computed.equal('editorState', DRAFT),

  openDraft: function(draft) {
    var controller = this;

    if (draft.get('action') == EDIT && draft.get('message_id')) {
      this.store.find('message', draft.get('message_id')).then(
        function(message) {
          return controller.editMessage(message);
        },
        function(error) {
          return controller.newMessage();
        }
      );
    } else {
      return controller.newMessage();
    }
  },

  newMessage: function() {
    var draft = this.store.createRecord('message', {action: Vine.Draft.REPLY});
    this.open(draft);
  },

  editMessage: function(message) {
    var draft = this.store.createRecord('message', {action: Vine.Draft.EDIT});
    draft.set('message', message);
    this.open(draft);
  },

  // new: null, true, true
  // edit: id, false, false
  open: function(draft, opts) {
    if (!opts) opts = {};
    
    // var promise = opts.promise || Ember.Deferred.create();
    // opts.promise = promise;

    // if (draft === void 0) {
    //   return promise.reject();
    // }

    var editorController = this;
    var current = this.get('model');

    // collapsed draft, cancel and open clean editor
    if (current && this.get('editorState') === DRAFT) {
      this.close();
      current = null;
    }

    if (current && !opts.tested && current.get('replyDirty')) {

      // current draft is making new reply or it's editing the same message we want to edit again
      if (current.get('action') === draft.get('action')
        && (draft.get('action') === Vine.Draft.Reply || (current.get('message_id') === draft.get('message_id')) )) {
        this.set('editorState', OPEN);
        // promise.resolve();
        return ;//promise;
      } else {
        opts.tested = true;
        if (!opts.ignoreIfChanged) {
          this.cancelEditor().then(
            function() { editorController.open(draft, opts); },
            function() { return promise.reject(); }
          );
        }
        return ;//promise;
      }
    }

    this.set('model', draft);
    this.set('editorState', OPEN);
    return;
    // promise.resolve();
    // return promise;
  },

  openIfDraft: function() {
    if (this.get('viewDraft')) {
      this.set('editorState', OPEN);
    }
  },

  close: function() {
    var model = this.get('model');
    if (model) { model.deleteRecord(); }
    this.set('model', null);
  },

  collapse: function() {
    this.saveDraft();
    this.set('editorState', DRAFT);
  },

  saveDraft: function() {
    var model = this.get('model');
    if (model) {
      // Do not save when drafts are disabled
      if (this.get('disableDrafts')) return;
      // Do not save when there is no reply
      if (!this.get('model.replyDirty')) return;
      // Do not save when the reply's length is too small
      if (this.get('model.replyLength') < Vine.SiteSettings.min_post_length) return;

      this.set('draftStatus', I18n.t('editor.saving_draft_tip'));

      var editor = this;

      // try to save the draft
      return model.save().then(
          function() { 
            editor.set('draftStatus', I18n.t('editor.saved_draft_tip')); 
          },
          function() { 
            editor.set('draftStatus', I18n.t('editor.drafts_offline'));  
          }
      );
    }
  },

  cancelEditor: function(){
    var editorController = this;

    return Ember.Deferred.promise(function (promise) {
      if (editorController.get('model.replyDirty')) {
        bootbox.confirm(I18n.t("message.abandon"), function(result) {
          if (result) {
            editorController.destroyDraft();
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

  toggle: function() {
    // this.closeAutocomplete();
    switch (this.get('editorState')) {
      case OPEN:
        if (Em.isEmpty('model.reply')) {
          this.close();
        } else {
          this.shrink();
        }
        break;
      case DRAFT:
        this.set('editorState', OPEN);
        break;
      case SAVING:
        this.close();
    }
    return false;
  },

  shrink: function() {
    if (this.get('model.replyDirty')) {
      this.collapse();
    } else {
      this.close();
    }
  } 
});

Vine.EditorController.reopenClass({
  CLOSED: CLOSED,
  SAVING: SAVING,
  OPEN: OPEN,
  DRAFT: DRAFT
});