

(function () {


    var views = module("WB.stats.views"),
        utils = module("WB.stats.utils");


    views.DaysAfterSignupGraph = views.BaseGraph.extend({

        preInitialize: function() {
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

        drawGraph: function (data, rootElement) {

            var getX = function (d) { return d.date; };
            var getY = function (d) { return d.daysAfterSignup; };

            var xDomain = d3.extent(data, getX);
            xDomain[0] = new Date(xDomain[0].getFullYear(), xDomain[0].getMonth(), xDomain[0].getDate() - 4);
            var xScale = d3.time.scale()
                .domain(xDomain)
                .range([0, this.width()]);

            var yScale = d3.scale.linear()
                .domain(d3.extent(data, getY))
                .range([this.height(), 0]);

            var getScaledX = utils.compose(getX, xScale);
            var getScaledY = utils.compose(getY, yScale);

            var xAxis = d3.svg.axis()
                .scale(xScale)
                .orient("bottom");

            var yAxis = d3.svg.axis()
                .scale(yScale)
                .orient("left");

            var circleGroup = rootElement.append("g").attr("class", "circles");

            var circles = circleGroup.selectAll("circle")
                .data(data)
                .enter()
                .append("circle")
                .attr("r", 4)
                .attr("cx", getScaledX)
                .attr("cy", getScaledY)
                .style("stroke", function(d) { return d.color; });

            var onTooltipOver = function(circle) { circle.transition().attr("r", 6); };
            var onTooltipOut = function(circle) { circle.transition().attr("r", 4); };
            utils.addTooltip(circles, this.tooltipTemplate, onTooltipOver, onTooltipOut);

            rootElement.append("g")
                .attr("class", "x axis")
                .attr("transform", utils.translateString(0, this.height()))
                .call(xAxis);

            rootElement.append("g")
                .attr("class", "y axis")
                .call(yAxis);

            var legend = rootElement.append("g")
                .attr("class", "legend")
                .attr("transform", utils.translateString(12, 0))
                .style("stroke", "#000");

            var colors = d3.entries(this.colors);
            var legendSelection = legend.selectAll("rect")
                .data(colors)
                .enter();

            legendSelection.append("rect")
                .attr("class", function(d) { return d.key; })
                .attr("width", 10)
                .attr("height", 10)
                .attr("y", function(d, i) { return (i * 15); })
                .style("fill", function(d) { return d.value; });

            legendSelection.append("text")
                .text(function (d) { return d.key.upperCaseFirstLetter(); })
                .attr("y", function (d, i) { return (i * 15) + 10; })
                .attr("x", 15)
                .attr("font-size", "10px");

        },

    });

})();