

(function() {

    var views = module("WB.stats.views"),
        utils = module("WB.stats.utils");



    views.TopMenu = Backbone.View.extend({

        events: {
            "click .item": "onItemClick"
        },

        items: {
            "activity": {
                labels: {
                    title: "Unique users",
                    x: "Date",
                    y: "Unique users",
                },
                graphClass: "ActivityGraph"
            },
            "signups-by-hour": {
                labels: {
                    title: "Signups by hour",
                    x: "Hour of day",
                    y: "Number of signups"
                },
                graphClass: "SignupByHoursGraph"
            },
            "days-after-signup": {
                labels: {
                    title: "Days after signup",
                    x: "Day of first purchase",
                    y: "Days from signup to first purchase"
                },
                graphClass: "DaysAfterSignupGraph"
            },
            "days-after-signup-histogram": {
                labels: {
                    title: "Days after signup histogram",
                    x: "Days from signup to first purchase",
                    y: "Count"
                },
                graphClass: "DaysAfterSignupHistogram"
            },
            "users-active": {
                labels: {
                    title: "Active users",
                    x: "Date",
                    y: "Number of active users"
                },
                graphClass: "TimeseriesGraph"
            },
            "vouchers-created-daily": {
                labels: {
                    title: "Vouchers created daily",
                    x: "Date",
                    y: "Number of vouchers created"
                },
                graphClass: "TimeseriesGraph"
            },
            "users-created-daily": {
                labels: {
                    title: "Users created daily",
                    x: "Date",
                    y: "Number of new signups"
                },
                graphClass: "TimeseriesGraph"
            },
            "subscriptions-valid-daily-sku-1": {
                labels: {
                    title: "Active yearly subscriptions",
                    x: "Date",
                    y: "Active yearly subscriptions"
                },
                graphClass: "TimeseriesGraph"
            },
            "subscriptions-valid-daily-sku-2": {
                labels: {
                    title: "Active monthly subscriptions",
                    x: "Date",
                    y: "Active monthly subscriptions"
                },
                graphClass: "TimeseriesGraph"
            },
            "users-total": {
                labels: {
                    title: "Total users count",
                    x: "Date",
                    y: "Total users signed up"
                },
                graphClass: "TimeseriesGraph"
            },
            "organization-income": {
                labels: {
                    title: "Organization income distribution",
                    x: "Organization income",
                    y: "Number of organizations"
                },
                graphClass: "OrganizationIncomeHistogram"
            },
            "daily-sales": {
                labels: {
                    title: "Daily sales by type",
                    x: "Date",
                    y: "Sales count by type"
                },
                graphClass: "DailySalesGraph"
            }
        },

        initialize: function(options) {
            utils.ensureProperty(options, "app", "Application needed in TopMenu init");
            this.app = options.app;
            this.render();
        },

        onItemClick: function(e) {
            var key = $(e.target).data("key");
            if (!_.has(this.items, key)) {
                throw "Key not found in items: " + key;
            }
            var item = this.items[key];
            var graph = new views[item.graphClass]({
                labels: item.labels,
                key: key
            });
            this.app.trigger("add-graph", graph);
        },

        render: function() {
            //this.$el.append($("<h4>Menu</h4>"));
            _.each(this.items, this.renderItem, this);
        },

        renderItem: function(item, key) {
            this.$el.append(this.createLinkForItem(item, key));
        },

        createLinkForItem: function(item, key) {
            return $("<div/>", {
                "class": "item",
                "id": "item-" + key,
                "text": item.labels.title,
                "data-key": key
            });
        }

    });

})();