

(function() {


    var views = module("WB.stats.views"),
        utils = module("WB.stats.utils");

    views.BaseGraph = Backbone.View.extend({
        preInitialize: function(options) {

        },

        postInitialize: function(options) {

        },

        initialize: function(options) {
            this.preInitialize(options);
            this.labels = options.labels;
            this.key = options.key;
            this.canvas = new views.Canvas({ cls: this.key, labels: this.labels });
            this.postInitialize(options);
        },

        createAndAppendLoader: function() {
            this.loader = $("<div/>", {
                "class": "loader",
                "text": "Loading..."
            });
            this.$el.append(this.loader);
        },

        showLoader: function() {
            this.loader.show();
        },

        hideLoader: function() {
            this.loader.hide();
        },

        width: function() {
            return this.canvas.width();
        },

        height: function() {
            return this.canvas.height();
        },

        render: function() {
            this.canvas.render(this.el);
            this.loadAndDraw();
        },

        loadAndDraw: function() {
            this.createAndAppendLoader();
            utils.loadData(this.url(), this.draw, this);
        },

        url: function() {
            throw "Url method should be overriden by subclass of BaseGraph";
        },

        drawGraph: function(data, rootElement) {
            throw "DrawGraph method should be overriden by subclass of BaseGraph";
        },

        parseDatum: function(data, rootElement) {
            throw "ParseDatum method should be overriden by subclass of BaseGraph";
        },

        unpackData: function(data) {
            return data;
        },

        parseData: function(data) {
            data = this.unpackData(data);
            return _.map(data, this.parseDatum, this);
        },

        draw: function(data) {
            console.log("About to draw")
            this.hideLoader();
            this.drawGraph(this.parseData(data), this.canvas.svg);
        },


    });

})();