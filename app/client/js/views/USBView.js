App.views.USBView = Backbone.View.extend({
  initialize: function() {
    this.render();
  },
  events: {
    'click .send': 'send',
    'click .restart': 'restart'
  },
  send: function(e) {
    var self = this;
    $.post('/api/usb.reset', {}, function(data) {
      console.log(data);
      self.$output.text(JSON.stringify(data, null, 2));
      Prism.highlightElement(self.$output.get(0));
    });
    e.preventDefault();
  },
  restart: function(e) {
    var self = this;
    $.post('/api/restart', {}, function(data) {
      console.log(data);
      self.$output.text(JSON.stringify(data, null, 2));
      Prism.highlightElement(self.$output.get(0));
    });
    e.preventDefault();
  },
  render: function() {
    // basic render
    $(this.el).html(this.template());
    this.$output = this.$el.find('.output');
    // return the view
    return this;
  }
});
