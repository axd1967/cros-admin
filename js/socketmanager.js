window.SocketManager = Ember.Object.extend({

	listeners : {},
	socket : null,
    connection : false,
    reconnect : false,
    timer : null,

    initConnection : function() {
        this.set("reconnect", true);
        this.connect();
    },
	
	connect : function() {
        if (this.get('connection') || !this.get("reconnect"))
            return;

        var self = this;

        var url = this.adapter.linkLibrary["datasocket"];
        url = url.replace(/https?/, "ws");

        var s = new WebSocket(url + "?authToken=" + this.authManager.token());
        this.set('socket', s);
        this.set('connection', true);

        if (s.readyState == 3 || s.readyState == 4) {
            this.onClose(); // Close socket immediately if connection failed
            return;
        } else {
            self.onMessage({data:'{"type": "notification","value": {"action" : "clear"}}'},self);
        }

        s.onClose = this.onClose;
        s.onmessage = function(event) {self.onMessage(event,self);};

        this.set('timer', setInterval(function() {
            var s = self.get('socket');
            if (s.readyState == 3 || s.readyState == 4) {
                s.onClose();
            }
        }, 1000));
    }.observes("connection"),

    onClose : function() {
        this.onMessage({data:'{"type": "notification","value": {"message" : "lost connection with server. Trying to reconnect..."}}'},this);

        var timer = this.get('time');
        if (timer) {
            clearInterval(timer);
        }
        this.set('connection', false);
    },

    disconnect : function() {
        clearInterval(this.get('timer'));
        this.get("socket").close();
        this.set("reconnect", false);
        this.set("connection", false);
    },
	
	onMessage : function(event, self) {
		var jsonData = $.parseJSON(event.data);
		if (self.listeners[jsonData.type]) {
			var callbacks = self.listeners[jsonData.type][0] || [];
			if (jsonData.id && self.listeners[jsonData.type][jsonData.id]) {
				callbacks.pushObjects(self.listeners[jsonData.type][jsonData.id]);
			}
			
			$.each(callbacks, function(index, callback) {
				callback(jsonData.value);
			});
		}
	},
	
	register : function(type, id, callback) {
		if (!id) {
			id = 0;
		}
		
		var typeCallbacks = this.listeners[type];
		if (typeCallbacks) {
			var idCallbacks = typeCallbacks[id] || [];
			idCallbacks.push(callback);
			typeCallbacks[id] = idCallbacks;
		} else {
			typeCallbacks = [];
			typeCallbacks[id] = [callback];
		}
		this.listeners[type] = typeCallbacks;
	}

});