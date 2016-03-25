App.views.UsersView = Backbone.View.extend({
  initialize: function() {
    this.model = new App.collections.UserCollection();
    this.model.fetch();
    this.render();
  },
  events: {
    'click #saveUser': 'add',
    'click .showForm': 'showForm'
  },
  add: function() {
    var user = {
      id: this.$el.find('#user_id').val(),
      code: this.$el.find('#user_code').val(),
      roles: _.map(this.$el.find('input[name=roles]:checked'), function(el) {
        return $(el).val();
      }),
      expires: this.$el.find('#user_expires').val(),
      name: this.$el.find('#user_name').val()
    };
    this.model.create(user);
    this.$el.find('#createUser').modal('hide');
  },
  showForm: function() {
    var today = new Date();
    var expires = today.setMonth(today.getMonth() + 6);
    var expiresDate = new Date(expires);
    this.form = new App.views.UserFormView({
      model: new App.models.User({
        id: '',
        name: '',
        code: '',
        expires: expiresDate.getFullYear() + '/' + expiresDate.getMonth() + '/' + expiresDate.getDate(),
        roles: ['member']
      })
    });
    $('.modal').find('.modal-title').text('Add User');
    $('.modal-body').html(this.form.el);
  },
  save: function() {
    var user = {
      id: this.$el.find('#user_id').val(),
      roles: _.map(this.$el.find('input[name=roles]:checked'), function(el) {
        return $(el).val();
      }),
      name: this.$el.find('#user_name').val()
    };
    this.model.create(user);
    this.$el.find('#createUser').modal('hide');
  },
  render: function() {

    var columns = [{
      name: "id",
      label: "ID",
      editable: false,
      cell: "string"
    }, {
      name: "name",
      label: "Name",
      cell: "string"
    }, {
      name: "roles",
      label: "Roles",
      cell: Backgrid.Extension.Select2Cell.extend({
        multiple: true,
        optionValues: [{
          name: 'roles',
          values: [['admin', 'admin'], ['member', 'member']]
        }]
      })
    }, {
      name: "expires",
      label: "Expiration",
      cell: "string"
    }, {
      name: "code",
      label: "RFID",
      cell: "string"
    }, {
      name: 'actions',
      label: 'Actions',
      editable: false,
      cell: App.views.ActionsCellView
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
    var $grid = this.$el.find('#user-grid');
    $grid.append(grid.render().el);

    // search field
    var filter = new Backgrid.Extension.ClientSideFilter({
      collection: this.model,
      fields: ['id', 'name', 'roles']
    });

    // Render the search filter
    this.$el.find('.search').html(filter.render().el);

    // return the view
    return this;
  }
});
