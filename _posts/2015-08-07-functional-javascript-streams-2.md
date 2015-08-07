---
layout: post
title: "Functional JavaScript Part 2: Streams"
excerpt: "Learn about streams with functional programming in JavaScript."
categories: [javascript]
tags: [javascript, functional programming]
comments: true
share: true
---
{% include _table-of-contents.html %}

This post picks up from a series on functional programming I started a few
months ago. In
[the last post](/javascript/functional-javascript-lists-1/), I explained
recursion and immutability through constructing the list data structure. In this
post, we will examine another concept in functional programming: **streams**.

## Streams

So, what are streams? I am sure you have probably heard of streams in JavaScript
and [Node](https://nodejs.org/api/stream.html) before, and streams in functional
programming are similar. One important use case for streams in functional
programming is to represent infinite data sequences such as the natural numbers.

But what is so special about streams? Well, just like streams in Node, we can
work with data in small chunks, avoiding exhausting memory. Imagine trying to
represent all the natural numbers in memory! When I say that we work in "small
chunks," I mean that we delay getting values in a stream until necessary. This
is called *lazy evaluation*.

With a stream of natural numbers, that means I would start the stream with the
value `1`. I would have to consume the stream again to get the next value of
`2`. Repeating this process would yield `3`, `4`, and so on.

## Creating Streams with Generators

If you have kept up with ES2015, this concept might sound familiar. Generator
functions afford us the power of streams in JavaScript. So how would we create a
stream of the natural numbers with generators?

{% gist 2e53bc2473c11ae03793 natural-numbers-generator-imperative.js %}

This is a pretty straightforward implementation. We keep track of the current
number in the sequence with `n`. We set `n = 1` because naturally (pun intended)
the natural numbers start with 1. Then, inside an infinite loop, we yield `n`
and increment it to the next number in the sequence.

However, this implementation is not very functional. We use mutation by
reassigning values to `n`. We could alter the implementation to use recursion:

{% gist 2e53bc2473c11ae03793 natural-numbers-generator-recursive.js %}

Now we create a generator function that uses an internal generator function
called `_naturalNumbers`. It takes `n` as a parameter with an initial value of
`1`. Inside our internal function, we yield `n` and then recursively yield a
call to the same function with `n + 1`. Notice the use of `yield *`. This
special syntax allows us to delegate a yielded value to another generator
function. If we had just used `yield`, we would have yielded a new instance of
the generator instead of the next number in the sequence.

There is still a problem with this implementation, though. Notice how we consume
our values with `nats.next().value`. That generator has to maintain state
internally for it to be able to yield each value in the sequence. That means
some mutation is taking place. If we want to be super strict about immutability
with functional programming, then we need to roll our own stream data structure.

## Creating the Stream Data Structure

How do we accomplish creating a stream data structure? Remember that streams are
lazy structures. We evaluate the first value but delay evaluating the remaining
values. That sounds like we need some type of callback to represent the
remaining values.

Hey! This is starting to sound like a list too. So, we need to create some type
of data structure with a head and a tail, where the tail is evaluated at a later
point in time. An implementation could look something like this then:

{% gist 2e53bc2473c11ae03793 natural-numbers-functional-stream-1.js %}

Now this is definitely more functional. We remove mutation and depend on
recursive calls of an internal function to generate the values in our stream.
Let's walk through this implementation.

I mentioned we use recursive calls to an internal function. We create the
internal function `_stream` that takes in our `n` parameter. It returns a
list-like data structure. The head is the `value` property which contains the
value of `n`. The tail is a function called `next` that returns a recursive call
to `_stream` with `n + 1` as an argument. This is similar to the recursive
generator implementation we had earlier. Finally to kick it all off, we return a
closure that calls `_stream` with our initial value of `1`.

Now one thing that is slightly irritating is the way we have to consume values.
We consecutively have to call the initial stream or the `next` function. What we
need is some helper function that can grab multiple values from the stream and
return them.

## The *take* Function

To help us solve the problem of consuming multiple values from a stream, we can
create the `take` function. `take` is a function that takes a number `n` and a
stream `str` and returns the first `n` values of `str`. An implementation of
`take` would look like:

{% gist 2e53bc2473c11ae03793 take.js %}

Again, we use an internal function to help us. (We could use an optional
parameter with the outer function instead, but that might not be considered
strictly functional.) The internal function `_take` takes the same argument
types as the outer function `take`, `n` and `str`, as well as another argument
`accum`. `accum` is short for accumulator, and it will be an array that holds
the values we have consumed from the stream.

We use recursion with `_take` to obtain our stream values. We grab the current
`value` and the `next` function from the current stream at line 7. Then we make
the recursive call at line 9. Notice we pass in `n - 1` and the next function as
our new stream. We also concatenate the current value to the `accum` array,
producing a new array that we pass in as the new accumulator.

Remember that we decrement `n` with `n - 1` in our recursive call. This is
important because it will lead to our base case when `n === 0`. At that point,
we no longer want to consume values from the stream, so we return whatever is in
`accum`.

This implementation is not without its faults because it will have a quadratic
runtime thanks to our calls to `accum.concat`. We could fix that with mutation
via `array.push` or using a list like the one in my last [functional programming
post](/javascript/functional-javascript-lists-1/), but we won't worry about that
here.

So, let's use our new `take` function to get the first ten natural numbers:

{% gist 2e53bc2473c11ae03793 natural-numbers-take.js %}

Great! This is not only simpler, but a more declarative way of consuming values
from a stream.

## Creating Other Streams

Now we could apply our new stream technique to create other infinite sequences.
What if we wanted to create a stream of the Fibonacci sequence? Remember the
Fibonacci sequence is a sequence of numbers where every number is the sum of the
previous two numbers in the sequence. We also need two base case numbers, 0 and 1.
Therefore, the sequence would be 0, 1, 1, 2, 3, 5, 8, etc. Implementing this as
a stream could look something like this:

{% gist 2e53bc2473c11ae03793 fibonacci-sequence-stream-1.js %}

Notice anything? Reapplying the stream technique to the Fibonacci sequence seems
duplicative. What we really need is a more DRY approach to creating streams.
Therefore, we need to abstract the construction of the stream data structure
into a reusable function. Then, we can build streams with just a function call:

{% gist 2e53bc2473c11ae03793 stream.js %}

This implementation closely models what we already did with the natural numbers
and the Fibonacci sequence. We create an internal `_stream` function that takes
some value and then returns an object literal that wraps that value and a
closure that produces the next value. Notice in the `next` function when we make
our recursive call that we also call the `fn` argument that was supplied to
`stream`. This is the function that is responsible for actually generating the
next value. In the case of the natural numbers, it would be a function that adds
1 to its argument.

Now we can convert our two streams to use our new `stream` function:

{% gist 2e53bc2473c11ae03793 stream-usage.js %}

With our new `stream` function, all we have to do is provide a recurrence
function and an initial value. Whatever is returned from the recurrence function
is used as the next value in the stream and is also the next argument to the
recurrence function (recurrence inception, I know). For the natural numbers,
that recurrence is simply adding 1 to the last number: `n + 1`.

But wait a minute! What is going on with the Fibonacci sequence? Our recurrence
function takes in an array and returns an array. Also, the output from
`console.log(take(10, fibs))` seems to be duplicating numbers. Recall that our
stream uses the return value from the recurrence function as the next argument
for the recurrence function. Also, recall that the Fibonacci sequence is defined
as the sequence of numbers where each number is the sum of the previous two
numbers. Therefore, we must use an array to keep track of the previous two
numbers. That presents a problem when we actually consume numbers in the
Fibonacci sequence. We only want the first element in each array returned from
the recurrence function. What we need is some way to map over streams.

## Mapping Over Streams

If streams are like lazy lists, then surely we can map over them
[like lists](/functional-javascript-lists-1/#map). However, we need to ensure
that a `map` function for streams does not consume the stream. That defeats the
purpose of the stream &mdash; not to mention that that would cause an infinite
loop.

Thus, `map` must produce a new stream itself. Then, when we consume the mapped
stream, we will get back the modified values of the original stream. We can
implement `map` like so:

{% gist 2e53bc2473c11ae03793 map.js %}

Essentially, what we do in `map` is reimplement our stream pattern from the
`stream` function. Our `initial` value will be the stream over which we want to
map. We also use an internal helper function called `_stream` that actually
produces the stream data structure.

When we return our stream data structure, we call the mapping function `fn` on the
recently consumed `value` from the original stream to produce the new `value`
property. With this implementation, we can lazily consume and transform the
values from the original stream. Now, we can fix our Fibonacci sequence along
with the aid of a helper function called `first`:

{% gist 2e53bc2473c11ae03793 fibonacci-mapped.js %}

Awesome! That fixes our issue and feels very functional, at least in the sense
of composing functions to produce our stream. We could even use `map` to create
the sequence of even numbers from our sequence of natural numbers:

{% gist 2e53bc2473c11ae03793 even-numbers-sequence.js %}

## Filtering Streams

So, we can map over our streams, but what if we wanted to filter values? For
example, with filtering we could create the sequence of odd numbers from our
natural numbers, or we could filter out numbers that are less than 42.
Unsurprisingly, we can write a `filter` function that is similar to our `map`
function:

{% gist 2e53bc2473c11ae03793 filter.js %}

{% gist 2e53bc2473c11ae03793 filter-usage.js %}

`filter`, like `map`, is very similar to the `stream` function. It uses the
original stream as the initial value, and its internal function `_stream`
filters over the consumed values of the original stream. `_stream` accomplishes
this by consuming a value and then running the filter callback `fn` on it. If
`fn` returns `true`, then `_stream` will essentially return what the original
stream data structure would have returned except the **new** `next` function
will filter on the `next` function from the **original stream**. If `fn` returns
`false`, then `_stream` will delegate its result by recursively calling itself
with the `next` function from the original stream.

## Conclusion

Streams are a powerful concept in JavaScript and functional programming. We can
represent infinite sequences without consuming a ton of memory. We can also use
the concepts of composition to create new sequences from other sequences through
lazy helper functions like `map` and `filter`. This notion of composition is
critical to functional programming and helps reinforce other concepts like
modularity and the single responsibility principle. Streams are an important
tool in the bag of functional and JavaScript programmers.
