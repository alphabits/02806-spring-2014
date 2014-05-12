
(function() {

    var views = module("WB.stats.views");


    views.Application = Backbone.View.extend({

        initialize: function() {
            this.render();
            this.menu = new views.TopMenu({
                app: this,
                el: this.$("#stat-menu")
            });
            this.graphList = new views.GraphList({
                app: this,
                el: this.$("#graph-list")
            });
        },

        render: function() {
            this.$el.html("<div id='stat-menu'></div><div id='graph-list'></div>");
        }


    });


})();