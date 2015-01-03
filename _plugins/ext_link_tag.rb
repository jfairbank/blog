module JF
  class ExtLinkTag < Liquid::Tag
    MATCH_REGEXP = %r[(https?://\S*)(.*)]

    def initialize(tag_name, content, tokens)
      super
      @content = content
    end

    def render(context)
      _, href, text = MATCH_REGEXP.match(@content).to_a
      text = href if text.nil? || text.strip.empty?
      %{<a href="#{href}" target="_blank">#{text.strip}</a>}
    end
  end
end

Liquid::Template.register_tag('ext_link', JF::ExtLinkTag)
