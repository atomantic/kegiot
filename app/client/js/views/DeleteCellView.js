App.views.DeleteCellView = Backgrid.Cell.extend({
    template: _.template('<button type="button" class="btn btn-danger center-block">Delete</button>'),
    events: {
      "click": "deleteRow"
    },
    deleteRow: function (e) {
      e.preventDefault();
      this.model.collection.remove(this.model).destroy();
    },
    render: function () {
        this.$el.html(this.template());
        this.delegateEvents();
        return this;
    }
});
