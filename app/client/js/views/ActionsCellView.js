App.views.ActionsCellView = Backgrid.Cell.extend({
    template: _.template('<div class="btn-group" role="group"><button type="button" class="btn btn-primary center-block edit">Edit</button><button type="button" class="btn btn-danger delete center-block">Delete</button></div>'),
    events: {
      'click .edit': 'editRow',
      'click .delete': 'deleteRow'
    },
    editRow: function (e) {
      e.preventDefault();
      if(this.model.collection instanceof App.collections.UserCollection) {
        this.form = new App.views.UserFormView({
          model: this.model
        });
        $('.modal').find('.modal-title').text('Edit User');
      }

      $('.modal').not('#errorModal').modal().find('.modal-body').html(this.form.el);
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
