

(function() {

    var utils = module("WB.stats.utils");


    String.prototype.upperCaseFirstLetter = function () {
        return this.charAt(0).toUpperCase() + this.slice(1);
    };

    utils.ensureProperty = function(obj, propertyKey, errorMessage) {
        if (obj == null || obj[propertyKey] == null) {
            throw errorMessage;
        }
    };

    utils.compose = function() {
        var fns = Array.prototype.slice.call(arguments);
        return function(value) {
            for (var i = 0; i < fns.length; i++) {
                value = fns[i](value);
            }
            return value;
        };
    };

    utils.addTooltip = function(selection, template, onOver, onOut) {
        var tooltip = d3.select("body")
            .append("div")
            .attr("class", "graph-tooltip")
            .style("visibility", "hidden");

        selection.on("mouseover", function(d) {
                onOver(d3.select(this));
                return tooltip.style("visibility", "visible").html(template(d));
            })
            .on("mousemove", function() {
                return tooltip.style("top", (event.pageY - 10) + "px").style("left", (event.pageX + 10) + "px");
            })
            .on("mouseout", function() {
                onOut(d3.select(this));
                return tooltip.style("visibility", "hidden");
            });
    };

    utils.translateString = function(left, top) {
        return "translate(" + left + "," + top + ")";
    };

    utils.getAxis = function(scale, orientation, ticks) {
        return d3.svg.axis().scale(scale).orient(orientation).ticks(ticks);
    };

    utils.loadData = function(url, onLoad, context) {
        d3.json(url, function(error, json) {
            if (error) {
                throw "Got error in json response";
            }
            onLoad.call(context, json);
        });
    };


})();