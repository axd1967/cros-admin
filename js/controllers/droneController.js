App.DroneController = Ember.ObjectController.extend({
  
	battery : "N/A",
	altitude : -1,
    location : [0,0],
    originalDroneStatus : null,

    initialization : function() {
        var self = this;
        // fetch initial data
        this.adapter.find("drone", this.get("model.id"), "battery").then(function(data) {
            self.set("battery", data.battery);
        });
        this.adapter.find("drone", this.get("model.id"), "altitude").then(function(data) {
            self.set("altitude", data.altitude);
        });
        this.adapter.find("drone", this.get("model.id"), "location").then(function(data) {
            self.set("location", Ember.Object.create({lat : data.location.latitude, lon: data.location.longitude}));
        });


        this.socketManager.register("batteryPercentageChanged", this.get("model.id"), "drone", function(data) {
            self.set('battery', data.percent);
            $('.batteryStatus').css('width', data.percent + '%');
            if(data.percent < 25)
                $('.batteryStatus').css('background-color', '#F00');
            else
                $('.batteryStatus').css('background-color', '#0A0');
        });

        this.socketManager.register("altitudeChanged", this.get("model.id"), "drone", function(data) {
            self.set("altitude", data.altitude.toFixed(2));
        });

        this.socketManager.register("locationChanged", this.get("model.id"), "drone", function(data) {
            self.set('location',Ember.Object.create({lat : data.latitude, lon : data.longitude}));
            // todo: do something with gpsheight...?
        });

        this.socketManager.register("droneStatusChanged", this.get("model.id"), "drone", function(data) {
            self.set('model.status',data.newStatus);
        });

        if (!this.get("originalDroneStatus")) {
            this.set("originalDroneStatus", this.get("model.status"));
        }
    }.observes("model"),

    automatic : function() {
        return this.get("model.status") === this.get("originalDroneStatus") && this.get("originalDroneStatus") !== "MANUAL_CONTROL";
    }.property("model.status"),

    speedvalue : 1,

    speedString : function() {
        return parseFloat(this.get("speedvalue")).toFixed(2);
    }.property("speedvalue"),

    manual : function() {
        return !this.get("automatic");
    }.property("automatic"),
    
    getModelClass: function(){
        var label = "label "
        var status = this.get('model.status');
        if(status == "AVAILABLE")
            return label + "label-success";
        else if(status == "FLYING" || status == "MANUAL_CONTROL")
            return label + "label-warning";
        else if(status == "UNKNOWN" || status == "INACTIVE")
            return label + "label-default";
        else if(status == "CHARGING")
            return label + "label-primary";
        else if(status == "EMERGENCY" || status == "ERROR" || status == "UNREACHABLE")
            return label + "label-danger";
        else
            return label + "label-default";
    }.property('model.status'),
    
    isNotDeletable: function(){
        this.get("model.status") !== "AVAILABLE"
    }.property("model.status"),

    controlError : "",
    hasControlError : function() {
        return this.get("controlError") !== "";
    }.property("controlError"),

    streamingVideo : function() {
        if (this.get("videoSocket")) {
            return this.get("videoSocket.connection");
        } else {
            return false;
        }
    }.property("videoSocket.connection"),

    currentFrame : "",
    videoPrefix : "data:image/jpeg;base64, ",

    videoProperty : function() {
        $("#videoStream").attr('src', this.get("videoPrefix").concat(this.get("currentFrame")));

        /*if (this.get("currentFrame"))
         return this.get("videoPrefix").concat(this.get("currentFrame"));
         else
         return "";*/
    }.observes("currentFrame"),

    closeStream : function() {
        if (this.get("streamingVideo")) {
            var socket = this.get("videoSocket");
            socket.disconnect();
            this.set("videoSocket", null);
        }
    },

    actions: {
        setAutomatic : function(){
            var self = this;
            this.set("model.status", this.get("originalDroneStatus"));
            self.set("controlError", "");
            this.adapter.edit('drone', this.get("model.id"), {drone : this.get("model")}).fail(function(data) {
                self.set("controlError", data.responseJSON);
            });
        },

        setManual : function() {
            var self = this;
            self.set("controlError", "");
            this.adapter.find("drone",this.get("model.id"), ["commands", "manual"]).then(function(data) {
                self.set("model.status", "MANUAL_CONTROL");
            }, function(data) {
                self.set("controlError", data.responseJSON);
            });
        },

        initVideo : function() {
            var self = this;
            this.adapter.find("drone", this.get("model.id"), "initVideo").then(function () {
                self.adapter.resolveLink("drone", self.get("model.id"), "videoSocket").then(function (url) {
                    var socket = window.SocketManager.create({defaultUrl: url.url, authManager:self.authManager });
                    self.set("videoSocket", socket);
                    socket.initConnection();

                    socket.register("JPEGFrameChanged", 0, "droneController", function(message) {
                        self.set("currentFrame", message.imageData);
                        self.videoProperty();
                    });
                });
            }, function (data) {
                if (data.responseJSON.reason)
                    self.set("controlError", data.responseJSON.reason);
                else
                    self.set("controlError", data.responseJSON);
            });
        },

        closeStreamAction : function() {
            this.closeStream();
        },

        emergency: function(id){
            this.adapter.find('drone',id,"emergency").then(function(data){
                console.log(data);
            });
        }
    }
});

App.DroneEditController = Ember.Controller.extend({
	actions: {
		save: function(){
			console.log('Do some saving here!');
			console.log(this.model);
		}
	}
});