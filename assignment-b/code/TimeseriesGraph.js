


(function() {

    var views = module("WB.stats.views"),
        utils = module("WB.stats.utils");


    views.TimeseriesGraph = views.BaseGraph.extend({

        preInitialize: function() {
            this.tooltipTemplate = _.template("<p>Date: {{dateString}}<br/>Value: <b>{{y}}</b></p>");
            this.dateFormatter = d3.time.format("%d-%m-%Y");
        },

        url: function() {
            return "/api/statistics/" + this.key;
        },

        parseDatum: function(d) {
            d.x = new Date(d.x);
            d.dateString = this.dateFormatter(d.x);
            return d;
        },

        unpackData: function(data) {
            return data.array[0].values;
        },

        getX: function(d) { return d.x; },
        getY: function(d) { return d.y; },

        drawGraph: function(data, rootElement) {
            console.log("Drawing timeseries ", data);
            var getX = this.getX;
            var getY = this.getY;
            var color = "#1f77b4";

            var xRange = d3.extent(data, getX);
            var xMin = xRange[0];
            xRange[0] = new Date(xMin.getFullYear(), xMin.getMonth(), xMin.getDate() - 1);

            /*var yRange = d3.extent(data, getY);
            yRange[1] = yRange[1] + 5;*/
            var yRange = [0, d3.max(data, getY) + 5];

            var xScale = d3.time.scale()
                .domain(xRange)
                .range([0, this.width()]);
            var yScale = d3.scale.linear()
                .domain(yRange)
                .range([this.height(), 0]);

            var getXScaled = utils.compose(getX, xScale);
            var getYScaled = utils.compose(getY, yScale);

            var xAxis = utils.getAxis(xScale, "bottom", 5);
            var yAxis = utils.getAxis(yScale, "left", 5);

            rootElement.append("g")
                .attr("class", "axis")
                .call(yAxis);

            rootElement.append("g")
                .attr("class", "axis")
                .attr("transform", utils.translateString(0, this.height()))
                .call(xAxis);


            var pageLine = d3.svg.line()
                .x(getXScaled)
                .y(getYScaled);
            rootElement.append("svg:path")
                .attr("d", pageLine(data))
                .style("stroke", color)
                .style("fill", "none")
                .style("stroke-width", "1.5");


            var dataCirclesGroup = rootElement.append('svg:g');

            var circles = dataCirclesGroup
                .selectAll('.data-point')
                .data(data);

            circles
                .enter()
                .append('svg:circle')
                .attr('class', 'dot')
                .style('fill', color)
                .attr('cx', getXScaled)
                .attr('cy', getYScaled)
                .attr('r', 4);

            var onTooltipOver = function(circle) { circle.style("opacity", 1); };
            var onTooltipOut = function(circle) { circle.style("opacity", 0); };
            utils.addTooltip(circles, this.tooltipTemplate, onTooltipOver, onTooltipOut);

        }

    

    

    });

})();