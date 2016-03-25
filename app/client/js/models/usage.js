App.models.Usage = Backbone.Model.extend({

  urlRoot: '/api/usage',

  initialize: function() {
    Backbone.Model.prototype.initialize.apply(this, arguments);
    this.on("change", function(model, options) {
      if (options && options.save === false) {
        return;
      }
      model.save();
    });
  }
});

App.collections.UsageCollection = Backbone.Collection.extend({

  model: App.models.Usage,
  url: '/api/usages'
});
