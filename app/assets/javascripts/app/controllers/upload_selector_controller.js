Vine.UploadSelectorController = Vine.Controller.extend(Vine.ModalFunctionality, {
  local: true,
  remote: Em.computed.not("local"),

  actions: {
    useLocal: function() { this.set("local", true); },
    useRemote: function() { this.set("local", false); },

    upload: function() {
      this.send('closeModal');

      if (this.get("local")) {
        $('#editor').fileupload('add', { fileInput: $('#filename-input') });
      } else {
        this.get('editorView').addMarkdown($('#fileurl-input').val());
      }
    }
  },

  onShow: function(){
    this.set('controllers.modal.modalClass', 'upload-selector-dialog');
  }
});

Vine.UploadSelectorController.reopenClass({
  translate: function(key, options) {
    var opts = options || {};
    if (Vine.Utilities.allowsAttachments()) { key += "_with_attachments"; }
    return I18n.t("upload_selector." + key, opts);
  }
});
