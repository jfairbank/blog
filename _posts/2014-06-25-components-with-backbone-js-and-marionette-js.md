---
layout: post
title: "Components with Backbone.js and Marionette.js"
description: "Build and use reusable components in Backbone.js and Marionette.js to make clean and modular code."
categories: [javascript]
tags: [javascript, backbone, marionette, component, modular]
comments: true
share: true
---
{% include _table-of-contents.html %}

A lot of my JavaScript work involves using [Backbone.js](http://backbonejs.org) and [Marionette.js](http://marionettejs.com) for the front-end. I really like other frameworks such as [Angular.js](http://angularjs.com) too. Despite the framework I find myself in, I immediately gravitate toward whatever modular patterns that framework facilitates. More specifically, I am interested in how I can build reusable components within the framework. Components are the objects that encapsulate some specific functionality and typically operate independently of the application as a whole. For example, imagine the cliché stock widget that displays stock symbols along with their current prices. It functions entirely on its own, but together with other components it makes up a dashboard page.

## Building and Maintaining Applications with Components
Components are critical to scaleable applications because they encourage separation of concerns. Each piece of an application, including components, should have one responsibility and not heavily depend on the other pieces. Applications with tightly coupled modules or a lack of division of work will become incredibly more difficult to maintain and amend with newer features. Adding a single feature could require changing code in several places. Altering a function here breaks a function there, which then requires this other function to handle another parameter. Discovering everything that breaks usually involves a trial-and-error process of integration tests with your eyeballs. Suddenly, you're traveling down the recursive Twilight Zone of refactoring _ad nauseam_ and other smart-people Latin phrases.

Components also encourage the [DRY principle](http://en.wikipedia.org/wiki/Don't_repeat_yourself). In case you don't know, the DRY principle stands for "Don't Repeat Yourself." You will waste extra time in the long run if you repeatedly write the same code, especially when you need to go back to refactor or add another feature. If you need to build a few datagrids with the same style but different data, then you should abstract that out into a reusable datagrid component. Then, all you need to do is configure each instance of the datagrid with its data. Components **GOOD**, monolithic applications **BAD**.

## Framework Components
Now, for the purpose of this article, we should have a shared idea of what a component is. I've already hinted at my understanding of a component. A component is akin to a sub-application, with its own views, models, state, business logic, and even sub-components. When it comes to JavaScript frameworks, Angular overtly offers components in the form of directives. Directives allow you to create custom HTML elements via a handful of syntactical options. You may also define a controller and scope for the directive to handle related business logic and state, respectively. The beauty of directives is how easily reusable they are. Define your own HTML element and then just plop it into your application views where you need it. You can even use them inside other directives in a way that would make Xzibit proud (fine, old joke, shame on me).

However, when it comes to Backbone.js, we don't necessarily have our go-to object to handle components. Yes, we have views which are reusable, but we would need to add several methods to a view to make it like a component. You would need both business logic and the boilerplate code to facilitate adding and removing to the DOM (without creating memory leaks). If you try to do this all with a single view, I'm fairly certain you'll violate the single responsibilty principle.

Well, this leaves us with rolling our own solution, which isn't a terrible idea. I advocate trying it out yourself and stretching your current understanding and abilities. However, countless other people have faced a similar issue, and someone has probably already built a robust solution that solves the problem.

## Modularity and Components in Marionette

In steps Marionette.js. [Marionette](http://marionettejs.com/) is an awesome library created by [Derick Bailey](http://derickbailey.com) to eliminate a host of the pains associated with building applications in vanilla Backbone. It offers a sensible boilerplate that supplies several view types, an application router, modules, an event aggregator, and many other objects. In my opinion, the greatest benefit of Marionette is that it empowers you to easily build modular Backbone applications.

As previously stated, Marionette offers modules, which are our go-to objects for segregating the different pieces of our application. They almost sound like components, but there is still a distinction. Modules operate as sub-applications and namespaces that separate the different concerns of our application. A music streaming application may have an account module for handling user account information and an albums module for displaying and filtering albums to listen to. Within the account module, we would have a component for updating billing information and another component for updating the email address and password.

However, we can use modules to act as components in Marionette. Let's walk through building a datagrid component for an orders dashboard page. (If you're unfamiliar with Marionette's objects and syntax, I encourage you to look at the docs on the GitHub repo [marionettejs/backbone.marionette](https://github.com/marionettejs/backbone.marionette) first.)

{% highlight javascript linenos %}
// File: app.js
// ------------

var MyApp = new Marionette.Application();

// Helper for switching modules, or sub apps
MyApp.startSubApp = function(subApp) {
  var currentApp = MyApp.module(subApp);

  if (MyApp.currentApp === currentApp) {
    return;
  }

  if (MyApp.currentApp) {
    MyApp.currentApp.stop();
  }

  App.currentApp = currentApp;

  currentApp.start();
};

MyApp.addRegions({
  mainRegion: '#main'
});

MyApp.on('start', function() {
  Backbone.history.start();
});
{% endhighlight %}

Here we set up our base application called `MyApp`, attach an existing HTML element with id `#main` to the app's `mainRegion`, and listen for the app's `start` event to make sure Backbone history is running. We also add a simple helper method `startSubApp` for managing the currently running sub-application, or module.

{% highlight javascript linenos %}
// File: orders/orders.js
// ----------------------

// Define our orders module
MyApp.module('Orders', function(Orders, MyApp, Backbone, Marionette, $, _) {

  // Router
  Orders.Router = Marionette.AppRouter.extend({
    appRoutes: {
      'orders/dashboard': 'ordersDashboard'
    }
  });

  // Controller
  Orders.Controller = Marionette.Controller.extend({
    ordersDashboard: function() {
      App.startSubApp('Orders.Dashboard');
      Orders.Dashboard.controller.show();
    }
  });

  // Initializers
  Orders.addInitializer(function() {
    Orders.controller = new Orders.Controller();

    Orders.router = new Orders.Router({
      controller: Orders.controller
    });
  });

});
{% endhighlight %}

This is our main orders module. We define the module, a router, and a controller for orders-related functionality. We ensure everything is properly wired up with a call to `addInitializer` on the module as well. Notice in `Orders.Controller#ordersDashboard` we start up and show the `Orders.Dashboard` submodule, which we define below.

{% highlight javascript linenos %}
// File: orders/dashboard/dashboard.js
// -----------------------------------

// Define our dashboard submodule
MyApp.module('Orders.Dashboard', function(Dashboard, MyApp, Backbone, Marionette, $, _) {

  Dashboard.startWithParent = false;

  // Model
  Dashboard.DashboardOrders = Backbone.Model.extend({
    defaults: {
      incompleteOrders: [],
      submittedOrders: [],
      shippedOrders: []
    },

    url: '/api/orders/dashboard'
  });

  // LayoutView
  Dashboard.LayoutView = Marionette.LayoutView.extend({
    template: '#orders-dashboard-layout-template',

    regions: {
      incompleteOrders: '#incomplete-orders'
    }
  });

  // Controller
  Dashboard.Controller = Marionette.Controller.extend({
    initialize: function(options) {
      this.region = options.region;
    },

    show: function() {
      this.layout = this.getLayout();
      this.region.show(this.layout);
    },

    getLayout: function() {
      var layout = new LayoutView();
      this.listenTo(layout, 'show', this.showGrid);
      return layout;
    },

    showGrid: function() {
      var dashboardOrders = new Dashboard.DashboardOrders();

      dashboardOrders.fetch().
        then(this._showGridComponent(
          this.layout.incompleteOrders,
          dashboardOrders.incompleteOrders
        ));
    },

    onDestroy: function() {
      Dashboard.DataGrid.stop();
    },

    _showGridComponent: function(region, dashboardOrders) {
      return function() {
        Dashboard.DataGrid.start({
          collection: dashboardOrders.incompleteOrders,
          region: region
        });

        Dashboard.DataGrid.controller.show();
      };
    }
  });

  // Initializers
  Dashboard.addInitializer(function(options) {
    Dashboard.controller = new Dashboard.Controller({
      region: MyApp.mainRegion
    });

    Dashboard.controller.show();
  });

  // Finalizers
  Dashboard.addFinalizer(function() {
    Dashboard.controller.destroy();
    delete Dashboard.controller;
  });

});
{% endhighlight %}

This is our `Dashboard` submodule. Notice we set `Dashboard.startWithParent = false`. This prevents the module from automatically running because we will want it to start only when we need it. In the controller after we show the layout, we fetch the dashboard orders and display the incomplete orders in a datagrid component via `showGrid` and `_showGridComponent`. If our module is stopped, we make sure to also stop the datagrid component in `onDestroy`.

{% highlight javascript linenos %}
// File: orders/dashboard/dataGrid.js
// ----------------------------------

// Define our datagrid module component
MyApp.module('Orders.Dashboard.DataGrid', function(DataGrid, MyApp, Backbone, Marionette, $, _) {

  DataGrid.startWithParent = false;

  // Views
  DataGrid.RowView = Marionette.ItemView.extend({
    template: '#orders-dashboard-datagrid-row-template',
    tagName: 'tr'
  });

  DataGrid.GridView = Marionette.CompositeView.extend({
    template: '#orders-dashboard-datagrid-template',
    childView: DataGrid.RowView,
    childViewContainer: 'tbody'
  });

  // Controller
  DataGrid.Controller = Marionette.Controller.extend({
    initialize: function(options) {
      this.region     = options.region;
      this.collection = options.collection;
    },

    show: function() {
      this.gridView = this.getGridView();
      this.region.show(this.gridView);
    },

    getGridView: function() {
      var gridView = new DataGrid.GridView({
        collection: this.collection
      });

      this.listenTo(gridView, 'foo', this.doBar);

      return gridView;
    },

    doBar: function() {
      console.log('I did bar!');
    }
  });

  // Initializers
  DataGrid.addInitializer(function(options) {
    DataGrid.controller = new DataGrid.Controller({
      region: options.region,
      collection: options.collection
    });
  });

  // Finalizers
  DataGrid.addFinalizer(function() {
    DataGrid.controller.destroy();
    delete DataGrid.controller;
  });

});
{% endhighlight %}

This is our `DataGrid` module component. Notice, we've set it up similar to the `Dashboard` module. We can instantiate our component and use it with `DataGrid.start` followed by `DataGrid.controller.show`.

{% highlight html linenos %}
<!-- Our view -->

<script id="orders-dashboard-layout-template" type="text/html">
  <h1>Orders Dashboard</h1>
  <div id="incomplete-orders"></div>
</script>

<script id="orders-dashboard-datagrid-row-template" type="text/html">
  <td><%= id %></td>
  <td><%= total %></td>
</script>

<script id="orders-dashboard-datagrid-template" type="text/html">
  <table>
    <thead>
      <tr>
        <th>ID</th>
        <th>Total</th>
      </tr>
    </thead>
    <tbody></tbody>
  </table>
</script>

<div id="main"></div>

<script src="app.js"></script>
<script src="orders/orders.js"></script>
<script src="orders/dashboard/dashboard.js"></script>
<script src="orders/dashboard/dataGrid.js"></script>
<script>
  MyApp.start();
</script>
{% endhighlight %}

Finally, our HTML view.

## Components Are Reusable

So, the datagrid module works almost perfectly as a component. It has its own logic, state, and view, but something isn't right. Remember components are reusable. If we set up a datagrid component using a module and then want to use it multiple times, we would encounter a problem. We're locked down to one instance of the component at any one time by the `controller` property set in the `addInitializer` call. We need to tweak our module to allow for multiple instances.

{% highlight javascript linenos %}
// File: orders/dashboard/dataGrid.js
// ----------------------------------

MyApp.module('Orders.Dashboard.DataGrid', function(DataGrid, MyApp, Backbone, Marionette, $, _) {

  // Let it start with parent now. This is usually the default for modules, but
  // I'm explicity setting it to true this time to show the difference with our
  // earlier version of this module.
  DataGrid.startWithParent = true;

  // Definitions for views and controller go here...

  // This time DON'T define initializers or finalizers. Instead we want to
  // create an interface for instantiating multiple component instances.

  DataGrid.newComponent = function(options) {
    return new DataGrid.Controller({
      region: options.region,
      collection: options.collection
    });
  };

});
{% endhighlight %}

Before, we depended on `DataGrid.start` to create a single instance of the component. Now, we have an interface for creating multiple component instances via our `DataGrid.newComponent` method. Therefore, we redefine our component module to automatically start with its parent, and we remove initializers and finalizers because we don't have to depend on `start` to use our component.

{% highlight javascript linenos %}
// File: orders/dashboard/dashboard.js
// -----------------------------------

MyApp.module('Orders.Dashboard', function(Dashboard, MyApp, Backbone, Marionette, $, _) {

  // Earlier definitions...

  // LayoutView
  Dashboard.LayoutView = Marionette.LayoutView.extend({
    template: '#orders-dashboard-layout-template',

    regions: {
      incompleteOrders: '#incomplete-orders',
      submittedOrders: '#submitted-orders',
      shippedOrders: '#shipped-orders'
    }
  });

  // Controller
  Dashboard.Controller = Marionette.Controller.extend({
    initialize: function(options) {
      this.region = options.region;
    },

    show: function() {
      this.layout = this.getLayout();
      this.region.show(this.layout);
    },

    getLayout: function() {
      var layout = new LayoutView({
        model: this.model
      });

      this.listenTo(layout, 'show', this.showGrids);

      return layout;
    },

    showGrids: function() {
      var dashboardOrders = new Dashboard.DashboardOrders();
      dashboardOrders.fetch().then(this._showGridComponents(dashboardOrders));
    },

    onDestroy: function() {
      _.each(this._grids, function(grid) {
        grid.destroy();
      });

      delete this._grids;
    },

    _showGridComponents: function(dashboardOrders) {
      var layout = this.layout;

      return function() {
        self._showGridComponent(layout.incompleteOrders, dashboardOrders.incompleteOrders);
        self._showGridComponent(layout.submittedOrders, dashboardOrders.submittedOrders);
        self._showGridComponent(layout.shippedOrders, dashboardOrders.shippedOrders);
      };
    },

    _showGridComponent: function(region, orders) {
      if (!this._grids) {
        this._grids = [];
      }

      var datagrid = Dashboard.DataGrid.newComponent({
        collection: orders,
        region: region
      });

      this._grids.push(datagrid);

      datagrid.show();
    }
  });

  // Define initializers and finalizers...

});
{% endhighlight %}

{% highlight html linenos %}
<!-- Add our other regions -->
<script id="orders-dashboard-layout-template" type="text/html">
  <h1>Orders Dashboard</h1>
  <div id="incomplete-orders"></div>
  <div id="submitted-orders"></div>
  <div id="shipped-orders"></div>
</script>
{% endhighlight %}

OK, now we have a component that is reusable. We instantiate our datagrid three times to display different categories of orders on our dashboard page. This seems to work well, but we can't deny the little bit of code smell.

## Create A Component Type

If we want to create more components in our application, we will have to repeat the same pattern of creating a new module and setting the `newComponent` method on it. We don't want to manually add the method to every module component. Yes, we could create a custom module with that method defined on its prototype and then let our module components inherit from it. But, that still doesn't address the issue of using modules for something they're not. All we've done is use a module as a glorified wrapper for other objects. In fact, our datagrid is really just two views and a controller. If all we really need to do is wrap other objects, then we should create a custom component type to use as our facade.

{% highlight javascript linenos %}
// File: lib/marionette.component.js
// ---------------------------------

Marionette.Application.prototype.component =
Marionette.Module.prototype.component = function(name, options) {
  var Component = this[name];

  if (!Component) {
    Component = Marionette.Component.extend(options);
    this[name] = Component;
  }

  return Component;
};

Marionette.Component = Marionette.Controller.extend({
  constructor: function(options) {
    options = options || {};

    this.region     = options.region;
    this.model      = options.model;
    this.collection = options.collection;

    Marionette.Controller.prototype.constructor.apply(this, arguments);
  },

  show: function() {
    this.showView();
  },

  showView: function() {
    var view = this.view = this.getView();

    this.listenTo(view, 'show', function() {
      this.triggerMethod('show:view');
    });

    this.region.show(view);
  }
});

Marionette.Component.define = function(options) {
  _.extend(this.prototype, options);
};
{% endhighlight %}

So, we've defined a new type: `Marionette.Component`. This component type is based off work Derick Bailey did when he and I developed together on a project. To actually create or use a component, we call `component` on an instance of a Marionette application or module. It attaches the component to the receiver and takes in options to add to the component prototype. We can also call `define` on our component type to add other properties to the prototype.

Notice the component type makes some assumptions about how it will be used. It takes a region for displaying itself along with a model and/or a collection. It has a `show` method, where it calls `showView`. Notice that `showView` calls `getView` but doesn't define it. When you create your own custom component type through this interface, you need to supply a `getView` method that returns your custom view instance (item view, collection view, layout view, etc.).

The component also listens for the `show` event on the view and triggers an `onShowView` method via the `this.triggerMethod('show:view')` call. So, you can also define an `onShowView` method if you need to do additional work after the view is displayed. Finally, the component displays the view in the supplied region.

Let's use our new component type to redefine our datagrid component.

{% highlight javascript linenos %}
// File: orders/dashboard/dataGrid.js
// ----------------------------------

// Define the component under the dashboard module now
MyApp.module('Orders.Dashboard', function(Dashboard, MyApp, Backbone, Marionette, $, _) {

  // Instead of a controller, use our module `component` method
  var DataGrid = Dashboard.component('DataGrid');

  // Views stay the same from the previous version...

  // Define the actual component type
  DataGrid.define({
    getView: function() {
      var gridView = new DataGrid.GridView({
        collection: this.collection
      });

      this.listenTo(gridView, 'foo', this.doBar);

      return gridView;
    },

    doBar: function() {
      console.log('I did bar!');
    }
  });

});
{% endhighlight %}

Notice that we still define the component within a module, but we're just reopening up our dashboard module to create the datagrid component on it. We still define the views in the same way, and then we define the datagrid type. Since we made assumptions about how components should be used (for example, take some basic options in their constructor and provide a `show` method), all we need to define is our `getView` method and any other custom logic we require.

{% highlight javascript linenos %}
// File: orders/dashboard/dashboard.js
// -----------------------------------

MyApp.module('Orders.Dashboard', function(Dashboard, MyApp, Backbone, Marionette, $, _) {

  // Earlier definitions...

  // Redefine our controller method for showing a grid
  Dashboard.Controller = Marionette.Controller.extend({
    // Earlier method definitions...

    _showGridComponent: function(region, order) {
      if (!this._grids) {
        this._grids = [];
      }

      var datagrid = new Dashboard.DataGrid({
        collection: orders,
        region: region
      });

      this._grids.push(datagrid);

      datagrid.show();
    }
  });

  // Define initializers and finalizers...

});
{% endhighlight %}

We make sure to update our dashboard controller to instantiate the datagrid components with the new component type constructor.

{% highlight html linenos %}
<script src="app.js"></script>
<script src="lib/marionette.component.js"></script>
<script src="orders/orders.js"></script>
<script src="orders/dashboard/dashboard.js"></script>
<script src="orders/dashboard/dataGrid.js"></script>
{% endhighlight %}

Finally, we add the component source file to our loaded scripts.

## Conclusion

So, we now understand how to build reusable components in Backbone.js and Marionette.js. We've learned that components allow us to reduce the amount of code we need to write and afford us more scaleable applications. I think this simple approach to components in Marionette can go a long way toward building modular applications. I'm sure there are ways to improve our component type and reduce even more repeated patterns. I know our method of defining and using modules could use some refactoring, possibly incorporating some of the same ideas we used to make our custom component type.

I hope you enjoyed this post, and I look forward to any questions or feedback!
