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

    if (draft.get('message_id')) {
      this.store.find('message', draft.get('message_id')).then(
        function(message) {
          if (draft.get('action') === Vine.Draft.EDIT) {
            return controller.editMessage(message, draft);
          } else {
            return controller.replyMessage(message, draft);
          }
        },
        function(error) {
          return controller.newMessage(draft);
        }
      );
    } else {
      return controller.open(draft);
    }
  },

  newMessage: function(draft) {
    var model = draft || Vine.Draft.create({action: Vine.Draft.REPLY});
    this.open(model);
  },

  editMessage: function(message, draft) {
    var model = draft || Vine.Draft.create({action: Vine.Draft.EDIT});
    model.set('message', message);
    model.set('message_id', message.get('id'));
    if (Em.isEmpty(model.get('reply'))) { model.set('reply', message.get('source')); }
    this.open(model);
  },

  replyMessage: function(message, draft) {
    var model = draft || Vine.Draft.create({action: Vine.Draft.REPLY});
    model.set('message', message);
    model.set('message_id', message.get('id'));
    if (Em.isEmpty(model.get('reply'))) { model.set('reply', message.get('source')); }
    this.open(model);
  },

  open: function(draft, opts) {
    if (!opts) opts = {};
    
    var promise = opts.promise || Ember.Deferred.create();
    opts.promise = promise;

    if (draft === void 0) {
      return promise.reject();
    }

    var editorController = this;
    var current = this.get('model');
    if (current && !opts.tested && current.get('replyDirty')) {

      // current draft is making new reply or it's editing the same message we want to edit again
      if (current.get('action') === draft.get('action') &&
          (draft.get('action') === Vine.Draft.Reply || (current.get('message_id') === draft.get('message_id')) )) {
        this.set('editorState', OPEN);
        promise.resolve();
        return promise;
      } else {
        opts.tested = true;
        if (!opts.ignoreIfChanged) {
          this.cancelEditor().then(
            function() { editorController.open(draft, opts); },
            function() { return promise.reject(); }
          );
        }
        return promise;
      }
    }

    this.set('model', draft);
    this.set('editorState', OPEN);
    promise.resolve();
    return promise;
  },

  save: function() {
    var message,
        model = this.get('model'),
        editorController = this;

    if (model) {
      if (this.get('model.cantSubmitMessage')) return;

      this.set('disableDrafts', true);

      if (model.get('action') === Vine.Draft.EDIT) {
        message = model.get('message');        
      } else if (model.get('action') === Vine.Draft.REPLY) {
        message = this.store.createRecord('message', {});
      }

      if (message) {
        message.set('source', model.get('reply'));
        message.save().then(
          function(result) {
            editorController.set('createdMessage', message);
            editorController.set('disableDrafts', false);
            editorController.close();
          },
          function(error) {
            editorController.set('disableDrafts', false);
            var errorMsg = error.responseText || error;
            bootbox.alert(errorMsg);
          }
        );
      } else {
        this.set('disableDrafts', false);
        bootbox.alert(I18n.t('editor.cant_save'));
      }
    }
  },

  openIfDraft: function() {
    if (this.get('viewDraft')) {
      this.set('editorState', OPEN);
    }
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

      this.set('model.draftStatus', I18n.t('editor.saving_draft_tip'));

      var editor = this;

      // try to save the draft
      return model.save().then(
          function() { 
            editor.set('model.draftStatus', I18n.t('editor.saved_draft_tip')); 
          },
          function() { 
            editor.set('model.draftStatus', I18n.t('editor.drafts_offline'));  
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
            editorController.close();
            promise.resolve();
          } else {
            promise.reject();
          }
        });
      } else {
        // it is possible there is some sort of crazy draft with no body ... just give up on it
        editorController.close();
        promise.resolve();
      }
    });
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
  },

  close: function() {
    Vine.Draft.clear();
    this.set('model', null);
    this.set('editorState', CLOSED);
  },

  collapse: function() {
    this.saveDraft();
    this.set('editorState', DRAFT);
  }
});

Vine.EditorController.reopenClass({
  CLOSED: CLOSED,
  SAVING: SAVING,
  OPEN: OPEN,
  DRAFT: DRAFT
});