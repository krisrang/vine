Vine.UploadSelectorView = Vine.ModalBodyView.extend({
  templateName: 'modal/upload_selector',
  classNames: ['upload-selector'],

  title: function() { return Vine.UploadSelectorController.translate("title"); }.property(),
  uploadIcon: function() { return Vine.Utilities.allowsAttachments() ? "fa fa-file" : "fa fa-picture-o"; }.property(),

  tip: function() {
    var source = this.get("controller.local") ? "local" : "remote";
    var opts = { authorized_extensions: Vine.Utilities.authorizedExtensions() };
    return Vine.UploadSelectorController.translate(source + "_tip", opts);
  }.property("controller.local"),

  hint: function() {
    // cf. http://stackoverflow.com/a/9851769/11983
    var isChrome = !!window.chrome && !(!!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0);
    // chrome is the only browser that support copy & paste of images.
    return I18n.t("upload_selector.hint" + (isChrome ? "_for_chrome" : ""));
  }.property(),

  didInsertElement: function() {
    this._super();
    this.selectedChanged();
  },

  selectedChanged: function() {
    var self = this;
    Em.run.next(function() {
      // *HACK* to select the proper radio button
      var value = self.get('controller.local') ? 'local' : 'remote';
      $('input:radio[name="upload"]').val([value]);
      // focus the input
      $('.inputs input:first').focus();
    });
  }.observes('controller.local')
});
