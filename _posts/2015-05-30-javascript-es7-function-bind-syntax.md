---
layout: post
title: "JavaScript ES7 Function Bind Syntax"
excerpt: "Bind JavaScript functions with a cleaner, more versatile syntax in ES7."
categories: [javascript]
tags: [javascript, es7, es2016, functions]
comments: true
share: true
---
{% include _table-of-contents.html %}

<p style="font-weight: bold; font-size: 1.5em;">
  <em>Bind your functions with this one weird trick!</em>
</p>

Sorry, I couldn't resist.

I write this post with hesitation but excitement. I have enjoyed playing around
with the new ECMAScript function bind syntax as proposed
[here](https://github.com/zenparsing/es-function-bind). This is a very early
proposal for addition in ES2016 (ES7, whatever) and could drastically change
or even be scrapped. Therefore, I recognize that this post may become obsolete.

I hope by advocating for this syntax, it will get the attention it deserves so
that it will become standard ES syntax. I find it to be a very versatile and
welcome tool in my JavaScript arsenal.

## The Syntax

So what does the syntax actually look like?

{% gist c64db36d16a2719d7a1d/syntax.js %}

That's pretty much it. The proposal introduces a new `::` operator that
simplifies function binding. Essentially, it offers syntactic sugar for calling
the `bind`, `call`, and `apply` methods on `Function.prototype`. The equivalent
ES5 code is below:

{% gist c64db36d16a2719d7a1d/syntax-compiled.js %}

We could call it a day at that, but I don't want to devalue the power that this
syntax affords us. Let's explore the ramifications of this syntax further.

## Iteration

How often have you done something like this in your JavaScript code?

{% gist c64db36d16a2719d7a1d/es5-iteration.js %}

Granted, you might be using a framework for your Todo app or a library like
lodash for iteration, but I don't doubt we've all used the native `Array`
methods on a different context at some point. It's tedious and messy, but it gets
the job done.

Now, with function bind syntax, we can make this code more expressive and
elegant:

{% gist c64db36d16a2719d7a1d/es7-iteration.js %}

The semantics remain the same, yet this reads more naturally and hides away the
uglier syntax we're accustomed to.

If you visit the proposal
([link](https://github.com/zenparsing/es-function-bind)), you'll see another
example where we can import helper functions from a hypothetical iteration
library to iterate over a collection. This creates a better separation of
concerns between data structures and function calls on those structures through
generalization.

Maybe your data structure needs to provide only one function for iteration, and
then you can import iteration "methods" that depend on the function. This
creates modularization possibilities in our JavaScript code similar to Ruby's
Enumerable module ([link](http://ruby-doc.org/core-2.2.2/Enumerable.html)).

## Callbacks

Another common pattern in JavaScript is passing callbacks to another function
like an event library. This becomes tricky when we desire a specific `this`
context for our callback. Normally, we have to create a reference to `this` in a
separate variable and refer to it in our callback, or we call
`Function.prototype.bind` on our callback, passing in `this`.

{% gist c64db36d16a2719d7a1d/es5-callbacks.js %}

Again, this is a little messy and slightly ugly. But with function bind syntax,
it becomes drastically simpler:

{% gist c64db36d16a2719d7a1d/es7-callbacks.js %}

This is powerfully expressive. No function wrapping. No explicit `bind` calls
(we're obviously still calling it via `::`, but we hide away those details). We
are declaring our intent that these functions should be called in response to an
event, and we're ensuring our `this` context with minimal effort.

## Chaining

If I wasn't already convinced by the function bind syntax, chaining is what
really sold it for me. Recently, I have been using
[PhantomCSS](https://github.com/Huddle/PhantomCSS) and
[CasperJS](http://casperjs.org/) for a CSS refactoring endeavor. Of course, I'm
on the up-and-up and utilizing ES2015 via [Babel](http://babeljs.io/) to write
my test suite. If you have not heard of PhantomCSS or CasperJS, I encourage you
to check them out. PhantomCSS is a very promising project for automating visual
regressions of your website. CasperJS is a wrapper over PhantomJS and SlimerJS,
offering a higher-level API.

For this particular project, I represent web pages as classes according to a
minimal interface. They each have a `run` method that takes in my `casper`
instance. From there, each class chains method calls on my `casper` instance,
returning the result. It's very "promisey." (I also added a few custom methods
to my instance to wrap over some other methods to make them more "promisey.")

To avoid duplication in some classes, I wanted to add some methods to the
`casper` instance that are specific to the concerns of that page. However, I
didn't want to pollute the actual object instance. Function bind syntax to the
rescue!

{% gist c64db36d16a2719d7a1d/es7-casper-chaining.js %}

That is amazing! I can naturally express the chaining semantics while decorating
my instance without altering it. Just as a reminder of what we would probably
have to do without function bind syntax, here is some equivalent ES2015 code:

{% gist c64db36d16a2719d7a1d/es6-casper-chaining.js %}

It gets the job done, but it doesn't flow as nicely as our chaining example.
Function bind syntax allows us to reduce how much code we write and effectively
express this notion of flowing through each step.

## Getting Started

If you'd like to try out function bind syntax, then I encourage you check it out
with Babel. If you've not heard of Babel, it's a transpiler that transforms
ES2015/2016 code into ES5. You can learn more about Babel from its website
([link](http://babeljs.io/)) and learn how to use function bind syntax
[here](http://babeljs.io/docs/usage/experimental/).

## Gripes, Caveats, Wishlist

I don't think this syntax is without its faults. I'm not entirely sold on the
actual `::` operator yet. Maybe it's the baggage I carry from other languages
like Ruby, PHP, and CoffeeScript, each which use that operator for different
semantics. Another option might be the `->` operator, but it's not my favorite
either (burnout from PHP and C, no doubt). The `::` operator might be the best
solution, and I don't necessarily hate it.

I haven't dived into the discussion over this spec, but to my knowledge there is
no affordance for partial application via this syntax. Recall that the `bind`
method on `Function.prototype` can also partially apply parameters to the bound
function by passing in additional arguments.

{% gist c64db36d16a2719d7a1d/es5-partial-application.js %}

I would like to see some type of partial application syntax, especially as we
continue to push the boundaries of functional-style programming in JavaScript.
Alas, I recognize that designing clean, efficient syntax is difficult. This may
just not be possible. Some quick ideas for a syntax could be:

{% gist c64db36d16a2719d7a1d/es7-partial-application.js %}

## Conclusion

Despite my small gripes and wishes, I readily welcome this proposal for ES2016
and hope the maintainers strongly consider its inclusion. This syntax opens up
the door for writing cleaner and more expressive JavaScript.
