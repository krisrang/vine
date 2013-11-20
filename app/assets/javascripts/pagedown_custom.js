window.PagedownCustom = {
  // execute is overridden in EditorView
  insertButtons: [
    {
      id: 'wmd-quote-post',
      description: I18n.t("editor.quote_message_title"),
      execute: function() {}
    }
  ],

  customActions: {
    "doBlockquote": function(chunk, postProcessing, oldDoBlockquote) {

      // When traditional linebreaks are set, use the default Pagedown implementation
      if (Vine.SiteSettings.traditional_markdown_linebreaks) {
        return oldDoBlockquote.call(this, chunk, postProcessing);
      }

      // Our custom blockquote for non-traditional markdown linebreaks
      var result = [];
      chunk.selection.split(/\n/).forEach(function (line) {
        var newLine = "";
        if (line.indexOf("> ") === 0) {
          newLine += line.substr(2);
        } else {
          if (/\S/.test(line)) { newLine += "> " + line; }
        }
        result.push(newLine);
      });
      chunk.selection = result.join("\n");

    }
  }
};
