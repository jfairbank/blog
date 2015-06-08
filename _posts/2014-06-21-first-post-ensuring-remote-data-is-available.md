---
layout: post
title: "First Post: Ensuring Remote Data is Available in JavaScript"
excerpt: "How to access remote data in JavaScript through a single interface, caching the data for future requests."
categories: [javascript]
tags: [javascript, ruby on rails, rspec, capybara, api, first post, programming]
comments: true
share: true
---
{% include _table-of-contents.html %}

## Greetings

Hello, my name is Jeremy Fairbank, and I am a front-end and back-end web developer.

So, I have wanted to do a development blog for a long time, but I become easily distracted by Reddit, video games, or that random programming question that has been racking my brain for the past few days, and I will not be able to sleep tonight unless I sit down at my computer to solve it... Whew. I admit I like to see instantaneous results from my work (that is probably why I am a programmer), so I simply cannot be bothered with all the minutiae of setting up a blog.

However, I get frustrated when I have a stroke of brilliance, swooping in to save the day with an incredibly elegant solution to a programming problem, and really want to share that with someone. You see, I am the development team where I work, so I do not have the junior developer to teach or the senior developer to probe for feedback and criticism. Half of my solutions could be terrible, unmaintable wrecks just waiting to rear their ugly heads in production months later.

Don't get me wrong, I still read articles and books and follow many a twitterer, so I'm always learning the thing I did last week was really stupid. OK, maybe not stupid, but definitely not as scaleable or maintainable as it could be. Ultimately, I **LOVE** to talk about programming, just ask my wife. I really want to be able to share my thoughts and opinions and garner feedback from fellow developers.

Therefore, what better way than to finally start my blog and jump right in with an interesting fix I implemented last week for a feature spec!

## The Problem

I can't really share the specific domain models used, so I will use some suitable substitutes for the problem.

We have a large single-page application for ordering a highly customizable product. This application is built upon [Backbone](http://backbonejs.org/) and [Marionette](http://marionettejs.com/) with a [Ruby on Rails](http://rubyonrails.org/) back-end. Now, let's say our configurable product is a car. Certain configuration options on the car will incur various upcharges. These upcharges will not change often, so they will be constant throughout a user's session on the application. Thus, one of the JavaScript files pulls down all the possible upcharge types from an API on the back-end.

```js title:"car.js"
var Car = Backbone.Model.extend();

// car/upcharges.js

var Upcharge = Backbone.Model.extend();

var Upcharges = Backbone.Collection.extend({
  model: Upcharge,
  url: '/api/upcharges'
});

var availableUpcharges = new Upcharges();
availableUpcharges.fetch();
```

So, `car/upcharges.js` immediately fetches the upcharges as soon as the browser loads the file. In a normal user session, this is completely acceptable because by the time the user can begin to use the application, the upcharges have loaded.

As the user navigates throughout the application, he/she will eventually make decisions that may require the application to add or remove different upcharges to a car. To handle this, the application uses another collection for managing which upcharges have been applied to the car based on a `key` field for each upcharge. Canonical upcharges have been seeded into the application with constant `key` names. For example, if the user wanted chrome rims, the application would add an upcharge via:

```js title:"app/some/module.js"
car.appliedUpcharges.addUpchargeByKey('chrome_rims');
```

The collection for applied upcharges might look something like this then:

```js title:"car/upcharges.js"
var Upcharges = Backbone.Collection.extend({
  // earlier definitions...

  getByKey: function(key) {
    return this.findWhere({ key: key });
  }
});

var AppliedUpcharges = Backbone.Collection.extend({
  model: Upcharge,

  addUpchargeByKey: function(key) {
    return this._getUpchargeByKeyAndRun(key, this.addUpcharge);
  },

  removeUpchargeByKey: function(key) {
    return this._getUpchargeByKeyAndRun(key, this.removeUpcharge);
  },

  addUpcharge: function(upcharge) {
    if (!this.has(upcharge)) {
      return this.add(upcharge.clone());
    }
  },

  removeUpcharge: function(upcharge) {
    return this.remove(upcharge);
  },

  _getUpchargeByKeyAndRun: function(key, callback) {
    var upcharge = availableUpcharges.getByKey(key);
    callback.call(this, upcharge);
  }
});
```

OK, so this is all fine and dandy and it works. Ehh, maybe we should move the logic for adding and removing upcharges to the back-end, but that's for another time and place to discuss. In fact, I'm more in favor of that idea, but it would defeat the purpose of this blog post.

Now, it's time to set up a feature spec because we want to make sure that the upcharges display on the order totals page. Given we use RSpec, Capybara, and FactoryGirl, a very simplified version of the feature spec might look something like this:

```ruby title:"car_spec.rb"
require 'spec_helper'
require 'features/helpers'

feature 'Configuring a car', js: true do
  given(:user)  { create(:user) }
  given(:order) { create(:order, :incomplete) }

  background do
    login_as user # Helper method from 'features/helpers'

    create(:upcharge, {
      key: 'chrome_rims',
      description: 'Chrome Rims',
      price: 1000
    })

    car = create(:car)

    order.car = car
    order.save
  end

  scenario 'Viewing the order totals page' do
    click_on 'Orders'

    within('#orders-table') do
      click_on "Order ##{order.id}"
    end

    click_on 'Configure Car'
    click_on 'Add Chrome Rims'
    click_on 'Order Totals'

    totals = find('#order-totals')
    expect(totals).to have_selector('.car-upcharge', count: 1)
    expect(totals).to have_selector('.car-upcharge', text: 'Chrome Rims')
  end
end
```

So, I run the spec and it *fails*. Okay... Did I not properly set up the order and car? Is there some random attribute that is still `nil` on a model that needs to have a value? After strategically (maybe a little randomly) placing `console.log`'s and `puts`'s, I discovered that my `availableUpcharges` variable was an empty collection. But, I added the chrome rims upcharge in my `background` block.

A couple more `console.log`'s and it begins to make sense. RSpec and Capybara load my application's assets before the `background` block runs. So, I fetch the available upcharges before any have even been created. This is problematic for a single page application that pulls remote data down once to use it for the remainder of the user's session. Yes, it's good to not create additional requests for remote data, but maybe immediately loading the data when the file loads isn't a good idea either.

## The Solution
What can we do then? A better solution would be to asynchronously load and use the available upcharges the first time they're needed. We could use a singleton object for managing the available upcharges like so:

```js title:"car/upcharges.js"
var AppliedUpcharges = Backbone.Collection.extend({
  // other definitions...

  // Redefine this function
  _getUpchargeByKeyAndRun: function(key, callback) {
    var self = this;

    availableUpcharges.ensured(function(upcharges) {
      var upcharge = upcharges.getByKey(key);
      callback.call(self, upcharge);
    });
  }
});

var availableUpcharges = {
  ensured: function(firstCallback) {
    var self = this;
    var upcharges = new Upcharges();

    upcharges.fetch({
      success: function() {
        self.ensured = function(callback) {
          callback(upcharges);
        };

        self.ensured(firstCallback);
      }
    })
  }
};
```

Now, we just call `availableUpcharges.ensured` first, passing it a callback function. We create one interface for accessing the real available upcharges, whether they're loaded yet or not. Our singleton object handles loading them the first time. Once they're loaded, it redefines it's `ensured` method to just simply pass the loaded upcharges to the callback.

I test it out in my application, but then I start to see multiple requests for the available upcharges. That's the exact opposite of what this is supposed to do. Then, I realize my error. You see, our application automatically checks for multiple upcharges based on measurement constraints. There are multiple configurable measurements that are interrelated. So, if a user's car had an atypical length-to-width ratio, then the application catches that on the order totals page and applies an appropriate upcharge. That way, if the user left the application and came back later, the application can recheck the car and update the upcharges as needed. Now, imagine there are several more of those measurement checks occurring all at once, meaning the application would call `addUpchargeByKey` and `removeUpchargeByKey` several times, calling `_getUpchargeByKeyAndRun` several times.

This presents a problem; if the application calls `_getUpchargeByKeyAndRun` multiple consecutive times and the available upcharges haven't loaded yet, then it is going to naturally create multiple requests for them because the `ensured` function has not been redefined yet. We need to tweak our singleton object to take this into account:

```js title:"car/upcharges.js"
var availableUpcharges = {
  queue: [],

  ensured: function(firstCallback) {
    this.queue.push(firstCallback);

    if (this.request) {
      return;
    }

    var self = this;
    var upcharges = new Upcharges();

    this.request = upcharges.fetch({
      success: function() {
        var currentCallback = null;

        self.ensured = function(callback) {
          callback(upcharges);
        };

        while (currentCallback = self.queue.shift()) {
          self.ensured(currentCallback);
        }

        delete self.request;
        delete self.queue;
      }
    });
  }
};
```

So, what's the difference? Well, until the available upcharges are loaded and the `ensured` function is redefined, we simply queue up every callback passed in and check to see if a request has already been made. Once the upcharges load, we redefine the function as before. We also clear our queue, calling the new `ensured` function definition with each queued callback. I run through the application again, and now there is only one request, and all the upcharge checks work properly. I rerun my spec and get my glorious green dot!

## Conclusion


I like this solution, and it's currently working fine in production and testing. Granted, the business logic for checking these upcharges should move to the back-end, but it's one of those refactors that gets overshadowed by other bugs and features (I'm sure you know what I mean). Regardless, I feel this is a relatively good starting point for handling this problem. You can use this type of approach to lazily load data in JavaScript that you may not need immediately.

I hope you enjoyed this post and please provide whatever questions or feedback you have!
