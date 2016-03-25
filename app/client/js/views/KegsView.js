App.views.KegsView = Backbone.View.extend({
  initialize: function() {
    this.model = new App.collections.KegCollection();
    this.model.fetch();
    this.render();
  },
  events: {
    'click #saveKeg': 'add'
  },
  add: function() {
    var keg = {
      id: _.uuid(),
      name: this.$el.find('#keg_name').val(),
      volume: this.$el.find('#keg_volume').val(),
      beer: this.$el.find('#keg_beer').val()
    };
    this.model.create(keg);
    this.$el.find('#createKeg').modal('hide');
  },
  render: function() {

    var columns = [{
      name: "name",
      label: "Name",
      cell: "string"
    }, {
      name: "beer",
      label: "Beer",
      cell: "string"
    }, {
      name: "volume",
      label: "Volume",
      cell: "string"
    }, {
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
    var $grid = this.$el.find('#keg-grid');
    $grid.append(grid.render().el);

    // search field
    var filter = new Backgrid.Extension.ClientSideFilter({
      collection: this.model,
      fields: ['name', 'beer']
    });

    // Render the search filter
    this.$el.find('.search').html(filter.render().el);

    // return the view
    return this;
  }
});
