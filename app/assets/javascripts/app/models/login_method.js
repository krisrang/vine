Vine.LoginMethod = Ember.Object.extend({
  title: function(){
    return this.get("titleOverride") || I18n.t("login." + this.get("name") + ".title");
  }.property(),

  message: function(){
    return this.get("messageOverride") || I18n.t("login." + this.get("name") + ".message");
  }.property()
});

Vine.LoginMethod.reopenClass({
  register: function(method){
    if(this.methods){
      this.methods.pushObject(method);
    } else {
      this.preRegister = this.preRegister || [];
      this.preRegister.push(method);
    }
  },

  all: function(){
    if (this.methods) { return this.methods; }

    var methods = this.methods = Em.A();

    [ "google",
      "persona"
    ].forEach(function(name){
      if(Vine.SiteSettings["enable_" + name + "_logins"]){

        var params = {name: name};

        if(name === "persona") {
          params.customLogin = function(){
            navigator.id.request({siteName: Vine.SiteSettings.title, siteLogo: assetPath('logo100w.png.uri')});
          };
          params.icon = "fa fa-envelope";
          params.color = "info";
        }

        if(name === "google") {
          params.color = "success";
          params.icon = "fa fa-google-plus-square";
          params.frameWidth = 850;
          params.frameHeight = 500;
        }

        methods.pushObject(Vine.LoginMethod.create(params));
      }
    });

    if (this.preRegister){
      this.preRegister.forEach(function(method){
        methods.pushObject(method);
      });
      delete this.preRegister;
    }
    return methods;
  }.property()
});

