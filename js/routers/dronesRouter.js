/**
 * Created by matthias on 11/04/2015.
 */

App.DronesRoute = App.AuthRoute.extend({
    model: function() {
        var self = this;
        return this.fetch({store:'drone', options : {pageSize : 2, page : 0, total:true}, callback: function(data) {
            return data;
        }});
    }
});

App.DroneRoute = App.PopupRoute.extend({
    model: function(params) {
        return this.fetch({store:'drone', id: params.drone_id });
    },

    setupController: function(controller, model) {
        this._super(controller,model);
        controller.initRegistration(model.id);
    },

    renderTemplate: function() {
        this._super('drone', 'drones');
    }
});

App.DroneEditRoute = App.PopupRoute.extend({
    model: function(params) {
        if(params.drone_id)
            return this.fetch({store:'drone', id: params.drone_id });
        else
            return { droneType: new Object() };
    },
    renderTemplate: function() {
        this._super('drones-edit', 'drones');
    }
});

App.DronesAddRoute = App.DroneEditRoute.extend({
    controllerName: 'drone-edit'
});
