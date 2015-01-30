---
layout: page
title: About Me
excerpt: Ruby and JavaScript Web Developer Jeremy Fairbank
tags: [about, programming, web development, ruby developer, javascript developer]
modified: 11-19-2014
comments: false
image:
  feature: hawaii-2.jpg
  credit: Jeremy Fairbank
  creditlink: http://jfairbank.github.io
---

Hi, my name is Jeremy Fairbank, and I am a web developer. I enjoy working with
JavaScript and Ruby, but I know my way around other languages.
I like to build modular, scalable applications with reasonable abstraction to keep things DRY. I really enjoy helping and teaching others, especially about JavaScript.

---

## Work

<a href="http://pushagency.io" class="push-logo" target="_blank"></a> <a href="http://www.simplybuilt.com" class="simplybuilt-logo" target="_blank"></a>

I work remotely on [SimplyBuilt](http://www.simplybuilt.com) for an awesome
company called Push ([pushagency.io](http://pushagency.io)).

---

## Open Source

<div id="open-source">
  <p>
    <img class="logo" src="/images/marionette-logo.png" width="64" alt="Marionette.js"/>

    I am a big fan of the {% ext_link http://marionettejs.com Marionette.js %}
    framework for {% ext_link http://backbonejs.org Backbone.js %} and am a core
    team member. Check out our repo at {% gh marionettejs/backbone.marionette %}.
  </p>

  <p>
    <img class="logo" src="/images/github-mark.png" width="64" alt="GitHub" />
    I also have a few open source libraries on GitHub such as my component library
    for Marionette.js,
    {% gh jfairbank/marionette.component Marionette.Component %},
    and a color manipulation gem for Ruby,
    {% gh jfairbank/chroma chroma %}.
  </p>

  <p>
    You can view my GitHub profile {% gh jfairbank here %}.
  </p>
</div>

---

## Conferences

{% assign talk = site.data.talks.nodevember_14 %}
<h3>{{ talk.conference }}<br><small>{{ talk.title }}</small></h3>

I had the amazing honor to give my first developer talk at the inaugural
{{ talk.conference_ext_link }} conference
in {{ talk.location }}.

{{ talk.video }}

---

## Besides Dev

Outside of web development I am a husband to my beautiful wife and a father to
my son. I play guitar and sing at my church and believe I would be pretty
messed up without the grace of God every day. I dabble in some photography and
really enjoy jazz and chill electronic music.

---

## Say Hello

Say hi to me at these places:

* [Twitter](http://twitter.com/{{ site.owner.twitter }})
* [GitHub](http://github.com/{{ site.owner.github }})
