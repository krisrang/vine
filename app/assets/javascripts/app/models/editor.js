// Vine.Editor = Vine.Model.extend({
//   open: function(opts) {
//     if (!opts) opts = {};
//     this.set('loading', false);

//     var replyBlank = Em.isEmpty(this.get("reply"));

//     if (!replyBlank &&
//         (opts.action !== this.get('action') || ((opts.reply || opts.action === this.EDIT) && this.get('reply') !== this.get('originalText'))) &&
//         !opts.tested) {
//       opts.tested = true;
//       return;
//     }

//     this.setProperties({
//       composeState: opts.editorState || OPEN,
//       action: opts.action || REPLY,
//       reply: opts.reply || this.get("reply") || "",
//       draft: opts.draft
//     });

//     this.set('originalText', opts.draft ? '' : this.get('reply'));

//     return false;
//   }
// });
