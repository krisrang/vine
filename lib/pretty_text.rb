require 'v8'
require 'nokogiri'
# require_dependency 'post'

module PrettyText

  # functions here are available to v8
  class Helpers
    def t(key, opts)
      str = I18n.t("js." + key)
      if opts
        # TODO: server localisation has no parity with client
        # should be fixed
        opts.each do |k,v|
          str.gsub!("{{#{k}}}", v)
        end
      end
      str
    end
    
    # def avatar_template(username)
    #   return "" unless username

    #   user = User.where(username_lower: username.downcase).first
    #   user.avatar_template if user.present?
    # end

    # def is_username_valid(username)
    #   return false unless username
    #   username = username.downcase
    #   return User.exec_sql('select 1 from users where username_lower = ?', username).values.length == 1
    # end
  end

  @mutex = Mutex.new
  @ctx_init = Mutex.new

  def self.mention_matcher
    Regexp.new("(\@[a-zA-Z0-9_]{#{User.username_length.begin},#{User.username_length.end}})")
  end

  def self.app_root
    Rails.root
  end

  def self.create_new_context
    ctx = V8::Context.new

    ctx["helpers"] = Helpers.new

    ctx_load(ctx,
              "vendor/assets/javascripts/lodash.js",
              "vendor/assets/javascripts/Markdown.Converter.js",
              "lib/headless_ember.js",
              "vendor/assets/javascripts/rsvp.js")

    ctx.eval("var Vine = {}; Vine.SiteSettings = #{SiteSetting.client_settings_json};")
    ctx.eval("var window = {}; window.devicePixelRatio = 2;") # hack to make code think stuff is retina
    ctx.eval("var I18n = {}; I18n.t = function(a,b){ return helpers.t(a,b); }");

    ctx.eval("Vine.BaseUrl = '#{Vine.base_url}';")

    ctx_load(ctx,
              "vendor/assets/javascripts/better_markdown.js",
              "vendor/assets/javascripts/sanitizer-bundle.js",
              "app/assets/javascripts/app/dialects/dialect.js",
              "app/assets/javascripts/app/lib/utilities.js",
              "app/assets/javascripts/app/lib/markdown.js")

    Dir["#{Rails.root}/app/assets/javascripts/app/dialects/**.js"].each do |dialect|
      unless dialect =~ /\/dialect\.js$/
        ctx.load(dialect)
      end
    end

    # quote
    # ctx['quoteTemplate'] = File.open(app_root + 'app/assets/javascripts/discourse/templates/quote.js.shbrs') {|f| f.read}
    # ctx['quoteEmailTemplate'] = File.open(app_root + 'lib/assets/quote_email.js.shbrs') {|f| f.read}
    # ctx.eval("HANDLEBARS_TEMPLATES = {
    #   'quote': Handlebars.compile(quoteTemplate),
    #   'quote_email': Handlebars.compile(quoteEmailTemplate),
    #  };")

    ctx
  end

  def self.v8
    return @ctx if @ctx

    # ensure we only init one of these
    @ctx_init.synchronize do
      return @ctx if @ctx
      @ctx = create_new_context
    end
    @ctx
  end

  def self.markdown(text, opts=nil)
    # we use the exact same markdown converter as the client
    # TODO: use the same extensions on both client and server (in particular the template for mentions)

    baked = nil

    @mutex.synchronize do
      context = v8

      context_opts = opts || {}
      context_opts[:sanitize] ||= true
      context['opts'] = context_opts

      context['raw'] = text

      # if Post.white_listed_image_classes.present?
      #   Post.white_listed_image_classes.each do |klass|
      #     context.eval("Discourse.Markdown.whiteListClass('#{klass}')")
      #   end
      # end

      # quote
      # context.eval('opts["mentionLookup"] = function(u){return helpers.is_username_valid(u);}')
      # context.eval('opts["lookupAvatar"] = function(p){return Vine.Utilities.avatarImg({size: "tiny", avatarTemplate: helpers.avatar_template(p)});}')

      baked = context.eval('Vine.Markdown.markdownConverter(opts).makeHtml(raw)')
    end

    baked
  end

  def self.cook(text, opts={})
    cloned = opts.dup
    # we have a minor inconsistency
    cloned[:topicId] = opts[:topic_id]
    sanitized = markdown(text.dup, cloned)
    sanitized = add_rel_nofollow_to_user_content(sanitized) if SiteSetting.add_rel_nofollow_to_user_content
    sanitized
  end

  def self.add_rel_nofollow_to_user_content(html)
    whitelist = []

    l = SiteSetting.exclude_rel_nofollow_domains
    whitelist = l.split(",") if l.present?

    site_uri = nil
    doc = Nokogiri::HTML.fragment(html)
    doc.css("a").each do |l|
      href = l["href"].to_s
      begin
        uri = URI(href)
        site_uri ||= URI(Vine.base_url)

        if !uri.host.present? ||
           uri.host.ends_with?(site_uri.host) ||
           whitelist.any?{|u| uri.host.ends_with?(u)}
          # we are good no need for nofollow
        else
          l["rel"] = "nofollow"
        end
      rescue URI::InvalidURIError
        # add a nofollow anyway
        l["rel"] = "nofollow"
      end
    end
    doc.to_html
  end

  # def self.extract_links(html)
  #   links = []
  #   doc = Nokogiri::HTML.fragment(html)
  #   # remove href inside quotes
  #   doc.css("aside.quote a").each { |l| l["href"] = "" }
  #   # extract all links from the post
  #   doc.css("a").each { |l| links << l["href"] unless l["href"].blank? }
  #   # extract links to quotes
  #   doc.css("aside.quote").each do |a|
  #     topic_id = a['data-topic']

  #     url = "/t/topic/#{topic_id}"
  #     if post_number = a['data-post']
  #       url << "/#{post_number}"
  #     end

  #     links << url
  #   end

  #   links
  # end

  def self.strip_links(string)
    return string if string.blank?

    # If the user is not basic, strip links from their bio
    fragment = Nokogiri::HTML.fragment(string)
    fragment.css('a').each {|a| a.replace(a.text) }
    fragment.to_html
  end

  protected

  def self.ctx_load(ctx, *files)
    files.each do |file|
      ctx.load(app_root + file)
    end
  end

end
