---
layout: page
title: Conferences
excerpt: JavaScript Web Developer Jeremy Fairbank's Conferences
tags: [conferences, programming, web development, javascript developer]
modified: 2-6-2016
comments: false
image:
  feature: hawaii-2.jpg
  credit: Jeremy Fairbank
  creditlink: http://blog.jeremyfairbank.com
---

{% for conf in site.data.conferences %}
  <div class="conference">
    <h3 class="conference__name">
      {% if conf.url %}
        <a href="{{ conf.url }}" target="_blank">{{ conf.name }}</a>
      {% else %}
        {{ conf.name }}
      {% endif %}
    </h3>

    {%if conf.blurb %}
      <p>
        {{ conf.blurb | replace: '#[conference_ext_link]', conf.ext_link | replace: '#[location]', conf.location }}
      </p>
    {% endif %}

    {% for talk in conf.talks %}
      <div class="talk">
        <h3 class="talk__title">
          {{ talk.title }}
        </h3>
        
        <ul class="talk__resources">
          {% if talk.video_url %}
            <li class="talk__resource">
              <a href="{{ talk.video_url }}" target="_blank">Video</a>
            </li>
          {% endif %}
        
          {% if talk.slides_url %}
            <li class="talk__resource">
              <a href="{{ talk.slides_url }}" target="_blank">Slides</a>
            </li>
          {% endif %}
        </ul>
      </div>
    {% endfor %}
  </div>
{% endfor %}
