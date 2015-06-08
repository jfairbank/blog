---
layout: post
title: "Polymer Web Components with Marionette.js"
excerpt: "Create and utilize Polymer web components in Marionette.js applications."
categories: [javascript]
tags: [javascript, marionettejs, backbonejs, polymer, front end]
comments: true
share: true
---
{% assign talk = site.data.talks.nodevember_14 %}
{% include _table-of-contents.html %}

JavaScript is a playground. If you disagree, then I encourage you to read
{% ext_link http://blog.codinghorror.com/the-principle-of-least-power/ Atwood's Law %}.
A quick Google search will reveal the law in full force with
{% ext_link http://pasm.pis.to/ assemblers %},
{% ext_link http://jsmess.textfiles.com/ machine emulators %}, and
{% ext_link https://github.com/jashkenas/coffeescript/wiki/List-of-languages-that-compile-to-JS/ programming languages %}
all written in JavaScript. That is just a small sampling. Go peruse the
{% ext_link https://www.npmjs.org/ npm registry %} for plenty of build tools, frameworks, and
servers written in JavaScript.  We are tinkerers, especially in the JavaScript community.
Sometimes our creations are practical and sometimes they are just fun.

With that introduction framing this post, I would like to show off some fun I had with Polymer
and Marionette.js recently.

## Web Components and Polymer

Before we dig in, here is a quick rundown of web components and Polymer if you are unsure
what they are.

Web Components as a standard intends to empower web applications to be modular through
native browser technologies. Four specs comprise Web Components: Custom Elements, HTML
Imports, Templates, and the Shadow DOM. Essentially, web components allow developers to
create reusable components with custom HTML elements. The Shadow DOM affords developers
encapsulation of their custom elements via a separate DOM tree that does not bleed into
the containing document. For more information on Web Components, you can visit
{% ext_link http://webcomponents.org/ webcomponents.org %}.

Developed by Google, Polymer is a project that aims to simplify defining web components.
To the best of its ability, Polymer also polyfills any functionality not natively
available in the browser (e.g. custom elements, HTML imports, etc.). For more information
on Polymer, you can visit {% ext_link https://www.polymer-project.org/ www.polymer-project.org %}.

## Marionette.js Components

Now, back to the topic of this post. I first developed the idea of making Polymer components
play along with Marionette.js for a talk on architecture and components I gave at the inaugural
{{ talk.conference_ext_link }} conference in {{ talk.location }}.* If you would like to watch
my talk, you can view it on <a href="{{ talk.video_url }}" target="_blank">YouTube</a>.

Toward the end of my talk, I demoed creating a custom name tag element. Furthermore, I showcased
the ability to wrap that custom element with a custom Marionette view type and keep model data
synced with a regular Marionette `ItemView`. I would like to go into more detail the steps
I took to create this custom Marionette view type and how I was able to keep model data synced.

## Building a Name Tag Element

Our name tag element will be pretty basic, displaying a name and job. We will also be able
to edit the name and job. To build the name tag element, we will use this simple Polymer
convention for creating custom elements:

{% gist 3b857598c2f7b1e12747 name-tag-1.html %}

There are few concepts to explain here. At line 1, we import our framework for defining
a custom element via an import link relation. At line 3, we define our custom element
by wrapping it with a `<polymer-element>` tag. We define the name of our custom element
via the `name` attribute. Note that custom elements require at least one hyphen for
their tag name. In other words, we cannot use `<nametag>`. We also publish attributes
for our custom element with the `attributes`... ahem, attribute. Publishing attributes
will allow us to set values for properties, which we will see in a second.

At lines 4-9, we define the template for our custom template by wrapping the template
content with a `<template>` tag. Note the mustache-like syntax to interpolate values for
`name` and `job`.

Finally at lines 11-14, we tell Polymer about the properties of our custom element. Note,
they match the attributes we published, and we give them default values.

Now we can use our custom element just like any other HTML element:

{% gist 3b857598c2f7b1e12747 name-tag-usage-1.html %}

<a href="/demos/polymer-components-with-marionette-js/name-tag-usage-1.html" target="_blank" class="btn">DEMO</a>

## Working with Marionette.js

Let us take this a step further and now integrate this with Marionette.js. If you are
unfamiliar with Marionette, it is a framework that simplifies Backbone.js application
development. You can learn more at {% ext_link http://marionettejs.com/ marionettejs.com %}.

What we want to accomplish is a way to not only instantiate our custom element with
Marionette but to also sync model data with other Marionette views. We will tackle the
former first, allowing us to do this:

{% gist 3b857598c2f7b1e12747 name-tag-usage-marionette-1.js %}

<a href="/demos/polymer-components-with-marionette-js/name-tag-usage-marionette-1.html" target="_blank" class="btn">DEMO</a>
(Note: demo may not work on mobile devices.)

As you can see above, our custom Marionette view type is called `Marionette.PolymerView`.
I have set up a basic GitHub repo for its implementation at
{% ext_link https://github.com/jfairbank/marionette.polymerview/ jfairbank/marionette.polymerview %}.
You can view the source in the below gist too:

{% gist 3b857598c2f7b1e12747 marionette.polymerview.js %}

It is not the most foolproof implementation, but it gets the job done and highlights how easily
we can work with a Polymer web component from Marionette. Instead of going line-by-line, I
will highlight the key things that `PolymerView` is doing.

At line 15, we grab the published attributes from the custom element via the `publish` property
on the custom element. Next, starting with the call to `this._initAttrsFromModel()` at line
9, we set the value of any published attributes on our custom element from the passed-in
Backbone model. At lines 10-11, we initialize events that will enable us to keep model data
and web component data in sync. In other words, whether I update my model or a property in
the web component, the other will be updated with that information. We will go into more detail
about that below.

## Syncing Data with Marionette.js

The final piece is to get data syncing to work. We can accomplish this by setting some property
watchers on our custom element. Unfortunately, I have not explored Polymer long enough
to find a way around this. Therefore, you cannot grab web components defined by someone else
and have data syncing with Marionette working out-of-the-box. Maybe a more general approach
is possible; maybe you can help me figure it out!

Nonetheless, we will tweak our name tag definition to include some property watchers:

{% gist 3b857598c2f7b1e12747 name-tag-2.html %}

At lines 15 and 19, we define two functions `nameChanged` and `jobChanged`, respectively.
These are our property watchers. Notice the syntax is property<em>Changed</em>. Whenever
`name` changes on our custom element (not the Backbone model!), `nameChanged` will be called.
This is automatically handled by Polymer. The same applies with `job` and `jobChanged`.
Notice in each function's body, we call `this.fire` with a custom event name. This is the
part that will allow us to notify Marionette about changes inside the custom element.

Our Marionette `PolymerView` will detect these changes by Backbone's event delegation.
Backbone's event delegation (via `delegateEvents`) is what is responsible for detecting
DOM events in your Backbone views and responding to them with your own callback.

{% highlight javascript linenos %}
var MyView = Backbone.View.extend({
  events: {
    'click button': 'doThatThang'
  },

  doThatThang: function() {
    console.log('hashtag yolo');
  }
});
{% endhighlight %}

We capitalize on this functionality to respond to those custom `fire` events we defined.
If you look at lines 26-36 of the `PolymerView` source above, you will see where we utilize
`delegateEvents` to listen for any attribute `fire` events. From there, we update our
model data with the changes via the `_updateAttrFromEl` function.

On the flip side, at lines 22-24, we listen for any changes on our model, and call
`_updateElAttrsFromModel` to update our custom element with those changes.

## All Together Now

Now we return to the original intent of this post. We want to show that the data is synced
between a custom element instantiated with `PolymerView` and an unrelated Marionette view.
We will define two other Marionette views, one for displaying information about a person
(basically like the name tag) and one for updating the person's name and job. We will
also define a Marionette layout for organizing our views. Our views and their templates
are below:

{% gist 3b857598c2f7b1e12747 views-1.js %}

{% gist 3b857598c2f7b1e12747 templates-1.html %}

Notice in our `views-1.js` that we again define a `NameTag` view from `PolymerView`. We
also define a `PersonFormView` for editing the person model data and a `PersonView` for
just displaying the person model data. Finally, we wire it all up:

{% gist 3b857598c2f7b1e12747 name-tag-usage-marionette-2.js %}

<a href="/demos/polymer-components-with-marionette-js/name-tag-usage-marionette-2.html" target="_blank" class="btn">DEMO</a>

(Again, the demo may not work on mobile devices.) Try editing the name and job in both
the `PolymerView` section and the `PersonFormView` section. You will see the name and job
update for the other views regardless of where you update the data!

## Conclusion

I know this is not anything groundbreaking. I do not doubt that someone has already done this.
Regardless, I think it shows the exciting possibilities of combining web technologies and
opens the door to incorporating web components into JavaScript applications already built
on existing frameworks. I hope this post ignites your curiosity and propels you
to play around with web components and join the big ole' JavaScript playground that we
love to have fun in from time to time.

If you have any trouble with the demo or ideas to improve this implementation, please
let me know in the comments or make a pull request at the GitHub repo.

**Notes:**<br>
\* If you are a JavaScript developer, I encourage you to support, talk at, and attend
{{ talk.conference_ext_link }}. The organizers did a fantastic job putting it together,
and the caliber of speakers was spectacular.
