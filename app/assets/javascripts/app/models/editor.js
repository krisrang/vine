var CLOSED = 'closed',
    SAVING = 'saving',
    OPEN = 'open',
    DRAFT = 'draft';

Vine.Editor = Vine.Model.extend({
  init: function() {
    this._super();
    var val = (Vine.Mobile.mobileView ? false : (Vine.KeyValueStore.get('composer.showPreview') || 'true'));
    this.set('showPreview', val === 'true');
    this.set('editorState', CLOSED);
  },

  open: function(opts) {
    if (!opts) opts = {};
    this.set('loading', false);

    this.setProperties({
      editorState: opts.editorState || OPEN
    });

    return false;
  },

  togglePreview: function() {
    this.toggleProperty('showPreview');
    Vine.KeyValueStore.set({ key: 'composer.showPreview', value: this.get('showPreview') });
  },

  toggleText: function() {
    return this.get('showPreview') ? I18n.t('composer.hide_preview') : I18n.t('composer.show_preview');
  }.property('showPreview'),

  hidePreview: Em.computed.not('showPreview')
});

Vine.Editor.reopenClass({
  CLOSED: CLOSED,
  SAVING: SAVING,
  OPEN: OPEN,
  DRAFT: DRAFT,
  
  open: function(opts) {
    var editor = Vine.Editor.create();
    editor.open(opts);
    return editor;
  }
});
