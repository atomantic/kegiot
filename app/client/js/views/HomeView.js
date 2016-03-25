App.views.HomeView = Backbone.View.extend({
    initialize: function(){
        this.render();
    },
    render: function () {
        $(this.el).html(this.template());
        return this;
    },
    loadChild: function(pageName){
        if(!this[pageName+'View']){
            this[pageName+'View'] = new App.views[pageName+'View']();
        }
        this.$el.find('.main').html(this[pageName+'View'].el);
        this.select(pageName+'-menu');
    },
    select: function(menuItem) {
        this.$el.find('.nav li').removeClass('active');
        this.$el.find('.' + menuItem).addClass('active');
    }
});
