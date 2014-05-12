

(function () {


    var views = module("WB.stats.views"),
        utils = module("WB.stats.utils");


    views.OrganizationIncomeHistogram = views.BaseGraph.extend({

        preInitialize: function () {
            this.tooltipTemplate = _.template("<p>Interval: <b>{{lower}}-{{upper}}</b><br/>Antal: {{count}}</p>");
            this.intFormatter = d3.format(",.0f"); 
        },

        url: function () {
            return "/api/statistics/extended/organization-income";
        },

        parseDatum: function (d) {
            d.lower = this.intFormatter(d.x);
            d.upper = this.intFormatter(d.x + d.dx);
            d.count = this.intFormatter(d.y);
            return d;
        },

        drawGraph: function (data, rootElement) {
            var values = _.pluck(data, "income");
            var height = this.height();
            var width = this.width();

            var x = d3.scale.linear()
                .domain(d3.extent(values))
                .range([0, width]);

            var ticks = x.ticks(20);

            data = d3.layout.histogram()
                .bins(ticks)(values);

            data = this.parseData(data);

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

            var bars = bar.append("rect")
                .attr("x", 1)
                .attr("width", x(data[0].dx) - 1)
                .attr("height", function (d) { return height - y(d.y); });

            utils.addTooltip(bars, this.tooltipTemplate, function() {}, function() {});

            var texts = bar.append("text")
                .attr("y", -6)
                .attr("x", x(data[0].dx) / 2)
                .attr("text-anchor", "middle")
                .text(function (d) { return d.count; });

            utils.addTooltip(texts, this.tooltipTemplate, function() {}, function() {});

            rootElement.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + height + ")")
                .call(xAxis);
        },

    });

})();