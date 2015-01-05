module JF
  class GhTag < Liquid::Tag
    MATCH_REGEXP = %r[(\S*)(.*)]

    def initialize(tag_name, repo, tokens)
      super
      @repo = repo
    end

    def render(context)
      _, repo, text = MATCH_REGEXP.match(@repo).to_a
      text = repo if text.nil? || text.strip.empty?
      %{<a class="gh-repo-link" href="https://github.com/#{repo}" target="_blank">#{text.strip}</a>}
    end
  end
end

Liquid::Template.register_tag('gh', JF::GhTag)
