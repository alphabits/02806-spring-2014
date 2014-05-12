

(function () {


    var views = module("WB.stats.views"),
        utils = module("WB.stats.utils");


    views.DailySalesGraph = views.BaseGraph.extend({

        preInitialize: function () {
            this.tooltipTemplate = _.template("<p>NewMonthlyCount: <b>{{newMonthlyCount}}</b></p>");
            this.dateFormatterShort = d3.time.format("%d-%m");
        },

        url: function () {
            return "/api/statistics/extended/daily-sales";
        },

        parseDatum: function (d) {
            d["date"] = new Date(d["date"]);
            d["dateString"] = this.dateFormatterShort(d.date);
            return d;
        },

        getTooltipTemplate: function(colors) {
            var decimalFormatter = d3.format(",.02f");
            var dateFormatter = d3.time.format("%d-%m-%y");
            return function(d) {
                var lines = colors.domain().map(function(key) {
                    return "<b style='color: " + colors(key) + "'>" + key.upperCaseFirstLetter() + "</b>: <b>" + d[key] + "</b>";
                });
                return "<p>Date: " + dateFormatter(d.date) + "<br/><br/>" + lines.join("<br/>") + "<br/><br/>Total sales: " + decimalFormatter(d.totalIncome) + "</p>";
            };
        },

        drawGraph: function (data, rootElement) {

            var width = this.width();
            var height = this.height();
            var getX = function(d) { return d.dateString; };
            var getTotalCount = function(d) { return d.totalSalesCount; };

            var xDomain = _.pluck(data, "dateString");

            var x = d3.scale.ordinal()
                .rangeRoundBands([0, width], .1)
                .domain(xDomain);

            var y = d3.scale.linear()
                .rangeRound([height, 0])
                .domain([0, d3.max(data, getTotalCount)]);

            var getXScaled = utils.compose(getX, x);

            var color = d3.scale.category10()
                .domain(["newYearlyCount", "newMonthlyCount", "renewedYearlyCount", "renewedMonthlyCount"]);

            var xAxis = d3.svg.axis()
                .scale(x)
                .orient("bottom");

            var yAxis = d3.svg.axis()
                .scale(y)
                .orient("left");

            var reversedDomain = color.domain().slice().reverse();
            data.forEach(function(d) {
                var y0 = 0;
                d.counts = reversedDomain.map(function(key) { return { key: key, y0: y0, y1: y0 += +d[key] }; });
            });

            rootElement.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + height + ")")
                .call(xAxis)
                .selectAll("text")
                    .attr("y", 0)
                    .attr("x", -8)
                    .attr("dy", "1.2em")
                    .attr("transform", "rotate(-60)")
                    .style("font-size", "10px")
                    .style("text-anchor", "end");

            rootElement.append("g")
                .attr("class", "y axis")
                .call(yAxis);

            var day = rootElement.selectAll(".day")
                .data(data)
                .enter().append("g")
                .attr("class", "g")
                .attr("transform", function(d) { return "translate(" + getXScaled(d) + ",0)"; });

            utils.addTooltip(day, this.getTooltipTemplate(color), function() {}, function() {});

            day.selectAll("rect")
                .data(function(d) { return d.counts; })
                .enter().append("rect")
                .attr("width", x.rangeBand())
                .attr("y", function(d) { return y(d.y1); })
                .attr("height", function(d) { return y(d.y0) - y(d.y1); })
                .style("fill", function(d) { return color(d.key); });

            var legend = rootElement.selectAll(".legend")
                .data(color.domain())
                .enter().append("g")
                .attr("class", "legend")
                .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

            legend.append("rect")
                .attr("x", width - 18)
                .attr("width", 18)
                .attr("height", 18)
                .style("fill", color);

            legend.append("text")
                .attr("x", width - 24)
                .attr("y", 9)
                .attr("dy", ".35em")
                .style("text-anchor", "end")
                .text(function(d) { return d.upperCaseFirstLetter(); });
        },

    });

})();