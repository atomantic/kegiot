App.models.Keg = Backbone.Model.extend({

    urlRoot: '/api/keg',

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

App.collections.KegCollection = Backbone.Collection.extend({

    model: App.models.Keg,
    url: '/api/kegs'
});
