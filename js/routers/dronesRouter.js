/**
 * Created by matthias on 11/04/2015.
 */

App.DronesRoute = App.AuthRoute.extend({
    model: function() {
        /*return this.fetch({store:'drone', options : {pageSize : 2, page : 0, total:true}, callback: function(data) {
            return data;
        }});*/
    }
});

App.DroneRoute = App.PopupRoute.extend({
    model: function(params) {
        var self = this;
        return this.fetch({store:'drone', id: params.drone_id});
    },

    setupController: function(controller, model) {
        this._super(controller,model);
    },

    renderTemplate: function() {
        this._super('drone', 'drones');
    }
});

App.ManualControlRoute = App.PopupRoute.extend({
    controllerName: 'manual',

    setupController: function(controller, model) {
        this._super(controller,model);
    },

    model: function(params) {
        var self = this;
        return this.fetch({store:'drone', id: params.drone_id});
    },

    renderTemplate: function() {
        this._super('manualControl', 'drones');
    },

    actions : {
        willTransition : function(transition) {
            if (this.get("controller").beforeClose()) {
                return true;
            } else {
                transition.abort();
            }
        }
    }
});

App.DroneEditRoute = App.PopupRoute.extend({
    setupController: function(controller, model) {
        this._super(controller,model);
        this.adapter.find("drone", null, "types").then(function(data) {
            controller.set("types", data.droneType.map(function(t) { return Ember.Object.create(t);}));
        });
    },

    model: function(params) {
        if(params.drone_id)
            return this.fetch({store:'drone', id: params.drone_id});
        else
            return { droneType: new Object() };
    },
    renderTemplate: function() {
        this._super('drone-edit', 'drones');
    }
});

App.DronesAddRoute = App.DroneEditRoute.extend({
    controllerName: 'drone-edit'
});
