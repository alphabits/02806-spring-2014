

(function () {


    var views = module("WB.stats.views"),
        utils = module("WB.stats.utils");


    views.DaysAfterSignupHistogram = views.BaseGraph.extend({

        preInitialize: function () {
            this.tooltipTemplate = _.template("<p>Date: {{dateString}}<br/>Days after signup: <b>{{daysAfterSignup}}</b><br/>Type: <span style='color:{{color}}'>{{productType}}</span></p>");
            this.dateFormatter = d3.time.format("%d-%m-%Y");
        },

        url: function () {
            return "/api/statistics/extended/days-after-signup";
        },

        parseDatum: function (d) {
            d["date"] = new Date(d["date"]);
            d["dateString"] = this.dateFormatter(d.date);
            d["color"] = this.colors[d.productType.toLowerCase()];
            return d;
        },

        colors: {
            "monthly": "#1f77b4",
            "yearly": "#ff7f0e"
        },

        drawGraph: function (data, rootElement) {// Generate a Bates distribution of 10 random variables.
            var values = _.pluck(data, "daysAfterSignup");
            var height = this.height();
            var width = this.width();

            // A formatter for counts.
            var formatCount = d3.format(",.0f");

            var x = d3.scale.linear()
                .domain(d3.extent(values))
                .range([0, width]);

            var ticks = x.ticks(20);
            console.log(ticks);

            // Generate a histogram using twenty uniformly-spaced bins.
            data = d3.layout.histogram()
                .bins(ticks)(values);

            console.log("Histogram data", data);

            var y = d3.scale.linear()
                .domain([0, d3.max(data, function (d) { return d.y; })])
                .range([this.height(), 0]);

            var xAxis = d3.svg.axis()
                .scale(x)
                .orient("bottom");

            var bar = rootElement.selectAll(".bar")
                .data(data)
              .enter().append("g")
                .attr("class", "bar")
                .attr("transform", function (d) { return "translate(" + x(d.x) + "," + y(d.y) + ")"; });

            bar.append("rect")
                .attr("x", 1)
                .attr("width", x(data[0].dx) - 1)
                .attr("height", function (d) { return height - y(d.y); });

            bar.append("text")
                .attr("y", -6)
                .attr("x", x(data[0].dx) / 2)
                .attr("text-anchor", "middle")
                .text(function (d) { return formatCount(d.y); });

            rootElement.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + height + ")")
                .call(xAxis);
        },

    });

})();