

(function() {


    var views = module("WB.stats.views"),
        utils = module("WB.stats.utils");


    views.SignupByHoursGraph = views.BaseGraph.extend({
        
        url: function() {
            return "/api/statistics/extended/signup-count-by-hours";
        },

        parseDatum: function(d) {
            return d;
        },

        drawGraph: function(data, rootElement) {

            var getX = function(d) { return d.hour; };
            var getY = function(d) { return d.signups; };
            var height = this.height();
            var numBins = data.length;
            var barMargin = 2;
            var barWidth = this.width() / numBins - (2*barMargin);

            var xScale = d3.scale.linear()
                .domain([-1, numBins])
                .range([0, this.width()]);

            var yScale = d3.scale.linear()
                .domain([0, d3.max(data, getY)])
                .range([this.height(), 0]);

            var getScaledX = utils.compose(getX, xScale);
            var getScaledY = utils.compose(getY, yScale);

            var xAxis = d3.svg.axis()
                .scale(xScale)
                .orient("bottom");

            var bar = rootElement.selectAll(".bar")
                .data(data)
              .enter().append("g")
                .attr("class", "bar")
                .attr("transform", function (d) { return utils.translateString(getScaledX(d) - (barWidth/2), getScaledY(d)); });

            bar.append("rect")
                .attr("x", 1)
                .attr("width", barWidth)
                .attr("height", function (d) { return height - getScaledY(d); });

            bar.append("text")
                .attr("y", -6)
                .attr("x", barWidth / 2)
                .attr("text-anchor", "middle")
                .text(getY);

            rootElement.append("g")
                .attr("class", "x axis")
                .attr("transform", utils.translateString(0, this.height()))
                .call(xAxis);
        }

    

    });

})();