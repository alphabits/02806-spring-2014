

(function() {

    var views = module("WB.stats.views"),
        utils = module("WB.stats.utils");

    var id = function(x) { return x; };

    views.Canvas = Backbone.View.extend({

        margins: {
            top: 40, right: 80, bottom: 60, left: 80
        },

        initialize: function (options) {
            utils.ensureProperty(options, "cls", "Class must be given in canvas initializer");
            utils.ensureProperty(options, "labels", "Labels must be given in canvas initializer");
            this.cls = options.cls;
            this.labels = options.labels;
        },

        outerWidth: 1080,
        outerHeight: 300,

        width: function() {
            return this.outerWidth - this.margins.left - this.margins.right;
        },

        height: function() {
            return this.outerHeight - this.margins.top - this.margins.bottom;
        },

        render: function(el) {
            this.svg = d3.select(el)
                .append("svg")
                .attr("class", this.cls)
                .attr("width", this.outerWidth)
                .attr("height", this.outerHeight)
                .append("g")
                .attr("transform", utils.translateString(this.margins.left, this.margins.top))
                .attr("width", this.width())
                .attr("height", this.height());

            //add the axes labels
            this.svg.append("text")
                .attr("class", "axis-label")
                .attr("text-anchor", "middle")
                .attr("x", this.width() / 2)
                .attr("y", this.height() + 50)
                .text(this.labels.x);

            this.svg.append("text")
                .attr("class", "axis-label")
                .attr("text-anchor", "middle")
                .attr("y", 6)
                .attr("dy", "-5.4em")
                .attr("x", -1*(this.height() / 2))
                .attr("transform", "rotate(-90)")
                .text(this.labels.y);
        },


    });

})();