var CLOSED = 'closed',
    SAVING = 'saving',
    OPEN = 'open',
    DRAFT = 'draft',

    // The actions the editor can take
    REPLY = 'reply',
    EDIT = 'edit';

Vine.Editor = Vine.Model.extend({
  editingMessage: Em.computed.equal('action', EDIT),
  replyingToMessage: Em.computed.equal('action', REPLY),

  viewOpen: Em.computed.equal('editorState', OPEN),
  viewDraft: Em.computed.equal('editorState', DRAFT),

  init: function() {
    this._super();
    var val = (Vine.Mobile.mobileView ? false : (Vine.KeyValueStore.get('editor.showPreview') || 'true'));
    this.set('showPreview', val === 'true');
    this.set('editorState', CLOSED);
  },

  open: function(opts) {
    if (!opts) opts = {};
    this.set('loading', false);

    var replyBlank = Em.isEmpty(this.get("reply"));

    if (!replyBlank &&
        (opts.action !== this.get('action') || ((opts.reply || opts.action === this.EDIT) && this.get('reply') !== this.get('originalText'))) &&
        !opts.tested) {
      opts.tested = true;
      return;
    }

    this.setProperties({
      composeState: opts.editorState || OPEN,
      action: opts.action || REPLY,
      reply: opts.reply || this.get("reply") || "",
      draft: opts.draft
    });

    // if (opts.post) {
    //   this.set('post', opts.post);
    //   if (!this.get('topic')) {
    //     this.set('topic', opts.post.get('topic'));
    //   }
    // }

    // // If we are editing a post, load it.
    // if (opts.action === EDIT && opts.post) {
    //   this.setProperties({
    //     title: this.get('topic.title'),
    //     loading: true
    //   });

    //   Discourse.Post.load(opts.post.get('id')).then(function(result) {
    //     composer.setProperties({
    //       reply: result.get('raw'),
    //       originalText: result.get('raw'),
    //       loading: false
    //     });
    //   });
    // }

    this.set('originalText', opts.draft ? '' : this.get('reply'));

    return false;
  },

  appendText: function(text) {
    this.set('reply', (this.get('reply') || '') + text);
  },

  // importQuote: function() {
  //   // If there is no current post, use the post id from the stream
  //   var postId = this.get('post.id') || this.get('topic.postStream.firstPostId');
  //   if (postId) {
  //     this.set('loading', true);
  //     var composer = this;
  //     return Discourse.Post.load(postId).then(function(post) {
  //       composer.appendText(Discourse.Quote.build(post, post.get('raw')));
  //       composer.set('loading', false);
  //     });
  //   }
  // },

  replyDirty: function() {
    return this.get('reply') !== this.get('originalText');
  }.property('reply', 'originalText'),

  // Whether to disable the post button
  cantSubmitMessage: function() {
    // Can't submit while loading
    if (this.get('loading')) return true;

    // reply is always required
    if (this.get('missingReplyCharacters') > 0) return true;

    return false;
  }.property('loading', 'replyLength', 'missingReplyCharacters'),

  missingReplyCharacters: function() {
    return this.get('minimumMessageLength') - this.get('replyLength');
  }.property('minimumMessageLength', 'replyLength'),

  minimumMessageLength: function() {
    return Vine.SiteSettings.min_message_length;
  }.property(),

  replyLength: function() {
    var reply = this.get('reply') || "";
    while (Vine.Quote.REGEXP.test(reply)) { reply = reply.replace(Vine.Quote.REGEXP, ""); }
    return reply.replace(/\s+/img, " ").trim().length;
  }.property('reply'),

  updateDraftStatus: function() {
    var $reply = $('#wmd-input');

    if ($reply.is(':focus')) {
      var replyDiff = this.get('missingReplyCharacters');
      if (replyDiff > 0) {
        return this.set('draftStatus', I18n.t('editor.min_length.need_more_for_reply', { n: replyDiff }));
      }
    }

    // hide the counters if the currently focused text field is OK
    this.set('draftStatus', null);

  }.observes('missingReplyCharacters'),

  saveDraft: function(draft) {
    // Do not save when drafts are disabled
    if (this.get('disableDrafts')) return;
    // Do not save when there is no reply
    if (!this.get('reply')) return;
    // Do not save when the reply's length is too small
    if (this.get('replyLength') < Vine.SiteSettings.min_post_length) return;

    draft.setProperties({
      reply: this.get('reply'),
      action: this.get('action')
    });

    this.set('draftStatus', I18n.t('editor.saving_draft_tip'));

    var editor = this;

    // try to save the draft
    return draft.save().then(
        function() { 
          editor.set('draftStatus', I18n.t('editor.saved_draft_tip')); 
        },
        function() { 
          editor.set('draftStatus', I18n.t('editor.drafts_offline'));  
        }
    );
  },

  // The text for the save button
  saveText: function() {
    switch (this.get('action')) {
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

  replyDirty: function() {
    return true;
  }.property('reply', 'originalText'),

  hidePreview: Em.computed.not('showPreview'),

  clearState: function() {
    this.setProperties({
      originalText: null,
      reply: null
    });
  }
});

Vine.Editor.reopenClass({
  CLOSED: CLOSED,
  SAVING: SAVING,
  OPEN: OPEN,
  DRAFT: DRAFT,

  REPLY: REPLY,
  EDIT: EDIT,
  
  open: function(opts) {
    var editor = Vine.Editor.create();
    editor.open(opts);
    return editor;
  },

  loadDraft: function(draft) {
    var editor;

    if (draft && !Em.isEmpty(draft.get('reply'))) {
      editor = this.open({
        action: draft.get('action'),
        reply: draft.get('reply'),
        draft: draft,
        composerState: DRAFT
      });
    }
    return editor;
  }
});
