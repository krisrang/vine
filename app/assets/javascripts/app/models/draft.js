// var attr = DS.attr;

// The actions the editor can take
var REPLY = 'reply',
    EDIT = 'edit';

Vine.Draft = Vine.Model.extend({
  // reply: attr(),
  // action: attr(),
  // message_id: attr('number'),
  // createdAt: attr('date'),

  // user: DS.belongsTo('user'),

  editingMessage: Em.computed.equal('action', EDIT),
  replyingToMessage: Em.computed.equal('action', REPLY),

  hidePreview: Em.computed.not('showPreview'),

  init: function() {
    this._super();
    var val = (Vine.Mobile.mobileView ? false : (Vine.KeyValueStore.get('editor.showPreview') || 'true'));
    this.set('showPreview', val === 'true');
  },

  replyDirty: function() {
    if (this.get('message')) {
      return this.get('reply') !== this.get('message.source');
    } else {
      return !Em.isEmpty(this.get('reply'));
    }
  }.property('reply'),

  replyLength: function() {
    var reply = this.get('reply') || "";
    while (Vine.Quote.REGEXP.test(reply)) { reply = reply.replace(Vine.Quote.REGEXP, ""); }
    return reply.replace(/\s+/img, " ").trim().length;
  }.property('reply'),

  // The text for the save button
  saveText: function() {
    switch (this.get('action')) {
      case EDIT: return I18n.t('editor.save_edit');
      case REPLY: return I18n.t('editor.reply');
    }
  }.property('action'),

  cantSubmitMessage: function() {
    // Can't submit while loading
    if (this.get('loading')) return true;

    if (!this.get('replyDirty')) return true;

    // reply is always required
    if (this.get('missingReplyCharacters') > 0) return true;

    return false;
  }.property('loading', 'replyLength', 'missingReplyCharacters', 'replyDirty'),  

  togglePreview: function() {
    this.toggleProperty('showPreview');
    Vine.KeyValueStore.set({ key: 'editor.showPreview', value: this.get('showPreview') });
  },

  toggleText: function() {
    return this.get('showPreview') ? I18n.t('editor.hide_preview') : I18n.t('editor.show_preview');
  }.property('showPreview'),

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

  missingReplyCharacters: function() {
    return this.get('minimumMessageLength') - this.get('replyLength');
  }.property('minimumMessageLength', 'replyLength'),

  minimumMessageLength: function() {
    return Vine.SiteSettings.min_message_length;
  }.property(),

  save: function() {
    return Vine.ajax("/drafts", {
      type: 'POST',
      data: {
        draft: {
          reply: this.get('reply'),
          action: this.get('action'),
          message_id: this.get('message_id')
        }
      }
    });
  }
});

Vine.Draft.reopenClass({
  REPLY: REPLY,
  EDIT: EDIT,

  clear: function() {
    return Vine.ajax("/drafts", {type: 'DELETE'});
  }
});