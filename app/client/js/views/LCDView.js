App.views.LCDView = Backbone.View.extend({
    initialize: function(){
        this.render();
    },
    events: {
      'click .send': 'send'
    },
    send: function(e){
      var $input = $(e.currentTarget).parent().find('input');
      var value = $input.val();
      var line = $input.data('line');
      $.post('/api/lcd', {
          line: line,
          value: value
        }, function(){
          console.log('posted to line '+line);
        });
      e.preventDefault();
    },
    render: function () {
        // basic render
        $(this.el).html(this.template());
        // return the view
        return this;
    }
});
