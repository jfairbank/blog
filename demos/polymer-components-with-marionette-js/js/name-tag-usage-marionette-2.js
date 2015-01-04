$(function() {
  var Layout = Marionette.LayoutView.extend({
    el: '#main',
    template: '#layout-template',
   
    regions: {
      nameTag: '#name-tag-container',
      personView: '#person-view-container',
      personForm: '#person-form-container'
    }
  });
   
  var NameTag = Marionette.PolymerView.extend({
    tagName: 'name-tag'
  });
   
  var PersonFormView = Marionette.ItemView.extend({
    template: '#person-form-template',
   
    ui: {
      name: 'input[name=name]',
      job: 'input[name=job]'
    },
   
    modelEvents: {
      'change': 'updateUI'
    },
   
    events: {
      'keyup input': 'updateModel'
    },
   
    updateUI: function() {
      var ui = this.ui;
      var changed = this.model.changed;
   
      _.each(changed, function(value, key) {
        if (ui[key].val() != value) {
          ui[key].val(value);
        }
      });
    },
   
    updateModel: function(e) {
      var key = e.target.name;
      var value = e.target.value;
      this.model.set(key, value);
    }
  });
   
  var PersonView = Marionette.ItemView.extend({
    template: '#person-view-template',
   
    modelEvents: {
      change: 'render'
    }
  });

  var Person = Backbone.Model.extend();
   
  var person = new Person({
    name: 'Jeremy Fairbank',
    job: 'Web Developer'
  });
   
  var nameTag = new NameTag({
    model: person
  });
   
  var personView = new PersonView({
    model: person
  });
   
  var personFormView = new PersonFormView({
    model: person
  });
   
  var layout = new Layout();
  layout.render();
   
  layout.getRegion('nameTag').show(nameTag);
  layout.getRegion('personView').show(personView);
  layout.getRegion('personForm').show(personFormView);
});
