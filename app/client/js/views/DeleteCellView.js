App.views.DeleteCellView = Backgrid.Cell.extend({
    template: _.template('<button type="button" class="btn btn-danger center-block">Delete</button>'),
    events: {
      "click": "deleteRow"
    },
    deleteRow: function(e) {
      var view = this;
      $(e.currentTarget).confirmation({
        singleton: true,
        placement: 'top',
        onConfirm: function(e) {
          e.preventDefault();
          view.model.collection.remove(view.model).destroy();
        }
      });
      $(e.currentTarget).confirmation('toggle');
    },
    render: function () {
        this.$el.html(this.template());
        this.delegateEvents();
        return this;
    }
});
