Vine.Utilities = {
  IMAGE_EXTENSIONS: [".png", ".jpg", ".jpeg", ".gif", ".bmp", ".tif", ".tiff"],
  IS_AN_IMAGE_REGEXP: /\.(png|jpg|jpeg|gif|bmp|tif|tiff)$/i,

  normalizeHash: function(hash, hashTypes) {
    for (var prop in hash) {
      if (hashTypes[prop] === 'ID') {
        hash[prop + 'Binding'] = hash[prop];
        delete hash[prop];
      }
    }
  },

  emailValid: function(email) {
    // see:  http://stackoverflow.com/questions/46155/validate-email-address-in-javascript
    var re = /^[a-zA-Z0-9!#$%&'*+\/=?\^_`{|}~\-]+(?:\.[a-zA-Z0-9!#$%&'\*+\/=?\^_`{|}~\-]+)*@(?:[a-zA-Z0-9](?:[a-zA-Z0-9\-]*[a-zA-Z0-9])?\.)+[a-zA-Z0-9](?:[a-zA-Z0-9\-]*[a-zA-Z0-9])?$/;
    return re.test(email);
  },

  // Determine the position of the caret in an element
  caretPosition: function(el) {
    var r, rc, re;
    if (el.selectionStart) {
      return el.selectionStart;
    }
    if (document.selection) {
      el.focus();
      r = document.selection.createRange();
      if (!r) return 0;

      re = el.createTextRange();
      rc = re.duplicate();
      re.moveToBookmark(r.getBookmark());
      rc.setEndPoint('EndToStart', re);
      return rc.text.length;
    }
    return 0;
  },

  // Set the caret's position
  setCaretPosition: function(ctrl, pos) {
    var range;
    if (ctrl.setSelectionRange) {
      ctrl.focus();
      ctrl.setSelectionRange(pos, pos);
      return;
    }
    if (ctrl.createTextRange) {
      range = ctrl.createTextRange();
      range.collapse(true);
      range.moveEnd('character', pos);
      range.moveStart('character', pos);
      return range.select();
    }
  },

  selectedText: function() {
    var html = '';

    if (typeof window.getSelection !== "undefined") {
      var sel = window.getSelection();
      if (sel.rangeCount) {
        var container = document.createElement("div");
        for (var i = 0, len = sel.rangeCount; i < len; ++i) {
          container.appendChild(sel.getRangeAt(i).cloneContents());
        }
        html = container.innerHTML;
      }
    } else if (typeof document.selection !== "undefined") {
      if (document.selection.type === "Text") {
        html = document.selection.createRange().htmlText;
      }
    }

    // Strip out any .click elements from the HTML before converting it to text
    var div = document.createElement('div');
    div.innerHTML = html;
    var text = div.textContent || div.innerText || "";

    return String(text).trim();
  },

  allowsAttachments: function() {
    return _.difference(Vine.SiteSettings.authorized_extensions.split("|"), Vine.Utilities.IMAGE_EXTENSIONS).length > 0;
  },

  authorizedExtensions: function() {
    return Vine.SiteSettings.authorized_extensions.replace(/\|/g, ", ");
  },

  validateUploadedFiles: function(files) {
    if (!files || files.length === 0) { return false; }

    // can only upload one file at a time
    if (files.length > 1) {
      bootbox.alert(I18n.t('message.errors.too_many_uploads'));
      return false;
    }

    var upload = files[0];

    // CHROME ONLY: if the image was pasted, sets its name to a default one
    if (upload instanceof Blob && !(upload instanceof File) && upload.type === "image/png") { upload.name = "blob.png"; }

    return Vine.Utilities.validateUploadedFile(upload, Vine.Utilities.isAnImage(upload.name) ? 'image' : 'attachment');
  },

  isAnImage: function(path) {
    return Vine.Utilities.IS_AN_IMAGE_REGEXP.test(path);
  },

  validateUploadedFile: function(file, type) {
    // check that the uploaded file is authorized
    if (!Vine.Utilities.isAuthorizedUpload(file)) {
      var extensions = Vine.Utilities.authorizedExtensions();
      bootbox.alert(I18n.t('message.errors.upload_not_authorized', { authorized_extensions: extensions }));
      return false;
    }

    // check file size
    var fileSizeKB = file.size / 1024;
    var maxSizeKB = Vine.SiteSettings['max_' + type + '_size_kb'];
    if (fileSizeKB > maxSizeKB) {
      bootbox.alert(I18n.t('message.errors.' + type + '_too_large', { max_size_kb: maxSizeKB }));
      return false;
    }

    // everything went fine
    return true;
  },

  isAuthorizedUpload: function(file) {
    var extensions = Vine.SiteSettings.authorized_extensions;
    var regexp = new RegExp("(" + extensions + ")$", "i");
    return file && file.name ? file.name.match(regexp) : false;
  },

  getUploadMarkdown: function(upload) {
    if (Vine.Utilities.isAnImage(upload.original_filename)) {
      return '<img src="' + upload.url + '" width="' + upload.client_width + '" height="' + upload.client_height + '">';
    } else {
      return '<a class="attachment" href="' + upload.url + '">' + upload.original_filename + '</a> (' + I18n.toHumanSize(upload.size) + ')';
    }
  },

  displayErrorForUpload: function(data) {
    // deal with meaningful errors first
    if (data.jqXHR) {
      switch (data.jqXHR.status) {
        // cancel from the user
        case 0: return;
        // entity too large, usually returned from the web server
        case 413:
          var maxSizeKB = Vine.SiteSettings.max_image_size_kb;
          bootbox.alert(I18n.t('message.errors.image_too_large', { max_size_kb: maxSizeKB }));
          return;
        // the error message is provided by the server
        case 415: // media type not authorized
        case 422: // there has been an error on the server (mostly due to FastImage)
          bootbox.alert(data.jqXHR.responseText);
          return;
      }
    }
    // otherwise, display a generic error message
    bootbox.alert(I18n.t('message.errors.upload'));
  }
};