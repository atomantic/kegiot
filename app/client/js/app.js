/**
 * this is the main backbone definition file for the app and backbone templates/routes
 */
// this is the main App namespace
// it's just a holding bucket for shared utilities
// and a list of our classes (views, models, routes) as well
// as references to the live instance of those classes
window.App = {
  socket: io.connect(),
  // user session
  session: {},
  // authed user data
  user: {
    name: 'default admin',
    id: 'adminuser',
    isAdmin: true,
    roles: ['admin']
  },
  // authed user's rostr profile
  rostr: {},
  // storage for our js/views/*.js definitions
  views: {},
  // storage for our js/models/*.js definitions
  models: {},
  // storage for our js/models/*.js collection definitions
  collections: {},
  // when we reload on an admin page (or other page that requires login)
  // that page handler will be stored in App.loginRoute
  // this will be triggered on our user event (from server socket)
  // loginRoute: _.fn,
  // onLogin: function() {
  //   authLib.getSession().then(function(session) {
  //     // set a cookie for the server (so the APIs will validate and allow this user--or not)
  //     document.cookie = 'auth=' + session.id;
  //     App.session = session;
  //     App.socket.emit('session', session);
  //   });
  // // TODO: lookup gravatar:
  // // $('#user-avatar').find('img').attr('src', gravatar);
  // },
  showError: function(message) {
    $('#errorModal').find('.modal-body').text(message).end().modal();
  },
  // helper utility for loading templates
  loadTemplates: function(views, callback) {
    var deferreds = [];
    console.log('loading views', views);
    $.each(views, function(index, view) {
      if (App.views[view]) {
        deferreds.push($.get('views/' + view + '.html', function(data) {
          App.views[view].prototype.template = _.template(data);
          console.log('template loaded: ', view);
        }, 'html'));
      } else {
        console.log(view + ' not found');
      }
    });
    $.when.apply(null, deferreds).done(callback);
  },
  // main routes
  Router: Backbone.Router.extend({
    routes: {
      '': 'status',
      'status': 'status',
      'alerts': 'alerts',
      'logout': 'logout',
      'admin/usage': 'usageAdmin',
      'admin/users': 'users',
      'admin/kegs': 'kegs',
      'admin/lcd': 'lcd',
      'admin/usb': 'usb',
      'admin/service': 'service',
      'admin/configs': 'configs',
      'usage': 'usage',
      'users': 'users'
    },
    initialize: function() {
      this.headerView = new App.views.HeaderView();
      $('.header').html(this.headerView.render().el);

      // Close the search dropdown on click anywhere in the UI
      $('body').click(function() {
        $('.dropdown').removeClass("open");
      });
    },
    // logout: function() {
    //   logoutLib.logout().then(function() {
    //     window.location = '/';
    //   }).catch(function(reason) {
    //     App.showError('Error while logging out:' + reason);
    //   });
    // },
    home: function() {
      if (!this.homeView) {
        this.homeView = new App.views.HomeView();
      }
      $('#content').html(this.homeView.el);
      this.headerView.select('home-menu');
    },
    status: function() {
      this.home();
      this.homeView.loadChild('Status');
    },
    usage: function() {
      this.home();
      this.homeView.loadChild('Usage');
    },
    usageAdmin: function() {
      // if (_.isEmpty(App.user)) {
      //   return (App.loginRoute = arguments.callee.bind(this));
      // }
      // if (!App.user.isAdmin) {
      //   return;
      // }
      this.admin();
      this.adminView.loadChild('AdminUsage');
    },
    admin: function() {
      if (!this.adminView) {
        this.adminView = new App.views.AdminView();
      }
      $('#content').html(this.adminView.el);
      this.headerView.select('admin-menu');
    },
    users: function() {
      // if (_.isEmpty(App.user)) {
      //   return (App.loginRoute = arguments.callee.bind(this));
      // }
      // if (!App.user.isAdmin) {
      //   return;
      // }
      this.admin();
      this.adminView.loadChild('Users');
    },
    lcd: function() {
      // if (_.isEmpty(App.user)) {
      //   return (App.loginRoute = arguments.callee.bind(this));
      // }
      // if (!App.user.isAdmin) {
      //   return;
      // }
      this.admin();
      this.adminView.loadChild('LCD');
    },
    usb: function() {
      // if (_.isEmpty(App.user)) {
      //   return (App.loginRoute = arguments.callee.bind(this));
      // }
      // if (!App.user.isAdmin) {
      //   return;
      // }
      this.admin();
      this.adminView.loadChild('USB');
    },
    service: function() {
      // if (_.isEmpty(App.user)) {
      //   return (App.loginRoute = arguments.callee.bind(this));
      // }
      // if (!App.user.isAdmin) {
      //   return;
      // }
      this.admin();
      this.adminView.loadChild('Service');
    },
    kegs: function() {
      // if (_.isEmpty(App.user)) {
      //   return (App.loginRoute = arguments.callee.bind(this));
      // }
      // if (!App.user.isAdmin) {
      //   return;
      // }
      this.admin();
      this.adminView.loadChild('Kegs');
    },
    configs: function() {
      this.admin();
      this.adminView.loadChild('Configs');
    }
  })
};
