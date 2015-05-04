/**
 * Created by Eveline on 21/04/2015.
 */
App.LineGraphComponent = Ember.Component.extend({

    draw: function(){
        var self = this
        $('.modal').on('shown.bs.modal', function (e) {
            var data = [{ label: 'A', values: [{ time: Date.now() / 1000 | 0, y: 0 }] }];
            var chart = $('#lineChart').epoch({
                type: 'time.line',
                data: data,
                className : "category10",
                axes: ['right', 'bottom']
            });
            self.set('chart',chart);

            self.socketManager.register("altitudeChanged", self.get("drone"), "linegraph", function(data) {
                var entry = [];
                var timestamp = Date.now() / 1000 | 0;
                entry.push({ time: timestamp, y: data.altitude.toFixed(2) });
                chart.push(entry);
            });
        });
    }.on('didInsertElement')

});
