// loads the app
(function() {

  // authLib.setLoginOptions({
  //   canCancel: true
  // });
  // authLib.getUser().then(
  //   App.onLogin,
  //   function(reason) {
  //     console.log("No user.", reason);
  //   }
  // );
  //
  // // server will look up session to map to configured user
  // App.socket.on('user', function(user) {
  //   App.user = user;
  //   var $body = $('body').addClass('isAuthed');
  //   if (_.contains(App.user.roles, 'admin')) {
  //     App.user.isAdmin = true;
  //     $body.addClass('isAdmin');
  //   }
  //   // if we were waiting to render a page until we had the user
  //   // do it now
  //   App.loginRoute();
  // });
  App.socket.on('rfid', function(data) {
    // if this user is an Admin, ask if we want to add this code to an existing user or
    // create a new user
    console.log(data);
    if (App.user.isAdmin) {
      $.notify(
        {
          title: 'New RFID Scanned!',
          message: '<br /><strong>' + data.code + '</strong><br />Who Does this ID belong to?<br /><label>User ID:&nbsp;</label><input type="text" name="id" /><button class="assignRFID">Assign</button>'
        },
        {
          allow_dismiss: true,
          delay: 0
        }
      );
      $('.assignRFID').one('click', function() {
        var $this = $(this);
        var id = $this.prev().val();
        var user;
        var collection;
        var d = new Date();
        d.setMonth(d.getMonth() + 3);
        $this.parent().parent().find('.close').click();

        if (App.router.adminView && App.router.adminView.UsersView.model) {
          collection = App.router.adminView.UsersView.model;
        } else {
          collection = new App.collections.UserCollection();
        }
        var addUpdateUser = function() {
          // only want to do this once
          collection.off('sync', addUpdateUser);
          // use existing users collection
          user = collection.get(id);

          if (!user) {
            collection.create({
              id: id,
              code: data.code,
              name: '',
              expires: d.getFullYear() + '/' + (d.getMonth() + 1) + '/' + d.getDate(),
              roles: ['member']
            });
            $.notify('ID has been saved and user has been created.');
          } else {
            // update user
            user.set('code', data.code);
            $.notify('ID has been saved.');
          }
        };

        collection.on('sync', addUpdateUser);

        collection.fetch();
      });
    }
  });

  App.socket.on('userscan', function(user) {
    console.log('userscan', user);
    $.notify(
      {
        title: 'User RFID Scanned!',
        message: '<br /><strong>' + user.name + '</strong><br />Just scanned'
      },
      {
        allow_dismiss: true,
        delay: 0
      }
    );
  });
  // load templates and start the backbone app
  App.loadTemplates([
    'AdminUsageView',
    'AdminView',
    'ConfigsView',
    'HeaderView',
    'HomeView',
    'KegsView',
    'LCDView',
    'USBView',
    'ServiceView',
    'StatusView',
    'UsageView',
    'UserFormView',
    'UsersView'
  ],
    function() {
      App.router = new App.Router();
      Backbone.history.start();
    }
  );
})();
