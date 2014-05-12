

(function() {

    var views = module("WB.stats.views"),
        utils = module("WB.stats.utils");

    views.GraphRow = Backbone.View.extend({

        events: {
            "click .close-graph-row": "closeRow"
        },

        tagName: "div",

        attributes: {
            "class": "graph-row"
        },

        initialize: function (options) {
            utils.ensureProperty(options, "graph", "GraphRow must be initialized with a graph");

            this.graph = options.graph;
            this.labels = this.graph.labels;

            this.render();
        },

        render: function() {
            this.$el.html("<div class='close-graph-row'>Close</div><div class='graph-container'></div><h5>" + this.labels.title + "</h5>");
            this.graph.setElement(this.$(".graph-container"));
            this.graph.render();
        },

        closeRow: function() {
            this.$el.remove();
        }

    });

})()