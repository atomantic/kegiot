App.models.User = Backbone.Model.extend({

    urlRoot: '/api/user',

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

App.collections.UserCollection = Backbone.Collection.extend({

    model: App.models.User,
    url: '/api/users'

});
