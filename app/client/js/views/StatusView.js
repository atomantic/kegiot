App.views.StatusView = Backbone.View.extend({
    initialize: function(){
        //var statusView = this;
        // $.get('/api/temperature', function(data){
        //     statusView.render(data);
        // });
        this.render();
    },
    render: function (data) {
        $(this.el).html(this.template(data));
        var tempertureData = [];
        var chart;
        nv.addGraph(function() {
            chart = nv.models.lineChart()
                .duration(0)
                .forceY([20,70]);
            chart.xAxis
                .axisLabel('Time')
                .tickFormat(function (d) {
                    return d3.time.format('%m:%S')(new Date(d));
                });
            chart.yAxis //Chart y-axis settings
            .axisLabel('°F').tickFormat(d3.format('1f'));
            d3.select('#temperature-chart svg').datum([{
                values: tempertureData,
                key: "temperature",
                color: "#FF0000"
            }]).call(chart);
            nv.utils.windowResize(chart.update);
            return chart;
        });
        App.socket.on('temp', function (temp) {
            // console.log('temp update: ', temp);
            tempertureData.push({x: _.now(), y: temp});
            if(tempertureData.length > 15){
                tempertureData.shift();
            }
            if(chart){
              chart.update();
            }
        });
        return this;
    }
});
