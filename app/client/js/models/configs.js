App.models.Config = Backbone.Model.extend({

    urlRoot: '/api/config',

    initialize: function () {
        Backbone.Model.prototype.initialize.apply(this, arguments);
        this.on("change", function (model, options) {
            if (options && options.save === false) {
                return;
            }
            model.save();
        });
    }
});

App.collections.ConfigCollection = Backbone.Collection.extend({

    model: App.models.Config,
    url: '/api/configs'
});
