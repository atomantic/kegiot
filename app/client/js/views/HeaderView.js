App.views.HeaderView = Backbone.View.extend({
  events: {
    'click .loginout-menu': 'loginout'
  },
  loginout: function() {
    if (!_.isEmpty(App.user)) {
      authLib.logout().then(function() {
        document.cookie = 'auth=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        window.location = '/';
      }).catch(function(reason) {
        App.showError('Error while logging out:' + reason);
      });
    } else {
      authLib.login().then(function(user) {
        App.onLogin(user);
        App.router.headerView.render();
      }).catch(function(reason) {
        console.error('Login failed:', reason);
      });
    }
  },
  render: function() {
    $(this.el).html(this.template());
    return this;
  },
  select: function(menuItem) {
    this.$el.find('.nav li').removeClass('active');
    this.$el.find('.' + menuItem).addClass('active');
  }
});
