$(function() {
  var NameTag = Marionette.PolymerView.extend({
    tagName: 'name-tag'
  });

  var mainRegion = new Marionette.Region({
    el: '#main'
  });

  var person = new Backbone.Model({
    name: 'Jeremy Fairbank',
    job: 'Web Developer'
  });

  var nameTag = new NameTag({
    model: person
  });

  mainRegion.show(nameTag);
});
