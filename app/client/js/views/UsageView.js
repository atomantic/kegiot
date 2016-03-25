App.views.UsageView = Backbone.View.extend({
  initialize: function() {
    this.model = new App.collections.UsageCollection();
    this.model.fetch();
    this.render();
  },
  render: function() {
    var columns = [{
      name: "user",
      label: "User",
      editable: false,
      cell: "string"
    }, {
      name: "date",
      label: "Date",
      editable: false,
      cell: "string"
    }, {
      name: "amount",
      label: "Volume",
      editable: false,
      cell: "string"
    }
    ];

    // Initialize a new Grid instance
    var grid = new Backgrid.Grid({
      columns: columns,
      collection: this.model
    });

    // basic user page render
    $(this.el).html(this.template());

    // render and place grid
    var $grid = this.$el.find('#usage-grid');
    $grid.append(grid.render().el);

    // search field
    var filter = new Backgrid.Extension.ClientSideFilter({
      collection: this.model,
      fields: ['user', 'date']
    });

    // Render the search filter
    this.$el.find('.search').html(filter.render().el);

    // return the view
    return this;
  }
});
