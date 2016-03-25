App.views.ConfigsView = Backbone.View.extend({
    initialize: function(){
        this.model = new App.collections.ConfigCollection();
        this.model.fetch();
        this.render();
    },
    events: {
        'click #saveConfig': 'add'
    },
    add: function(){
        var config = {
            id: _.uuid(),
            name: this.$el.find('#config_name').val(),
            value: this.$el.find('#config_value').val()
        };
        this.model.create(config);
        this.$el.find('#createConfig').modal('hide');
    },
    render: function () {

        var columns = [{
          name: "name",
          label: "Name",
          cell: "string"
        }, {
          name: "value",
          label: "Value",
          cell: "string"
        },{
          name: "delete",
          label: "Actions",
          cell: App.views.DeleteCellView
        }];

        // Initialize a new Grid instance
        var grid = new Backgrid.Grid({
          columns: columns,
          collection: this.model
        });

        // basic user page render
        $(this.el).html(this.template());

        // render and place grid
        var $grid = this.$el.find('#config-grid');
        $grid.append(grid.render().el);

        // search field
        var filter = new Backgrid.Extension.ClientSideFilter({
          collection: this.model,
          fields: ['name','value']
        });

        // Render the search filter
        this.$el.find('.search').html(filter.render().el);

        // return the view
        return this;
    }
});
