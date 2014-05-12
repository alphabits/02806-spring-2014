

(function() {

    var views = module("WB.stats.views");


    views.GraphList = Backbone.View.extend({

        initialize: function(options) {
            this.app = options.app;
            this.app.on("add-graph", this.onAddGraph, this);
            this.rows = [];
            this.render();
            console.log("Graph list init", this.$el);
        },

        render: function() {
            //this.$el.append($("<h4>Grafer</h4>"));
        },

        onAddGraph: function(graph) {
            var row = new views.GraphRow({
                graph: graph
            });
            this.rows.push(row);
            console.log("Appending element", row.$el);
            this.$el.append(row.$el);
        }


    });


})();