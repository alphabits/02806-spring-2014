

(function() {


    var views = module("WB.stats.views"),
        utils = module("WB.stats.utils");


    views.ActivityGraph = views.TimeseriesGraph.extend({

        url: function() {
            return "/api/statistics/extended/daily-activity";
        },

        parseDatum: function(d) {
            d.x = new Date(d.date);
            d.y = d.uniqueUsers;
            d.dateString = this.dateFormatter(d.x);
            return d;
        },

        unpackData: function(data) {
            return data;
        },

    });

})();