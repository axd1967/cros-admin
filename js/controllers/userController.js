/**
 * Created by Eveline on 9/04/2015.
 */
App.UserController = Ember.ObjectController.extend({

    _private_currentUserId : null,

    isNotCurrentUser: function(id){
        if (!this.get("_private_currentUserId")) {
            this.fetchUserInfo();
        }
        return (this.get("_private_currentUserId") != this.get('id'));
    }.property('id'),

    fetchUserInfo: function(){
        var self = this;
        return App.AuthManager.get("user").then(function (data) {
            console.log(data);
            var canEdit = false;
            if (data.role == "ADMIN") {
                canEdit = true;
            }
            self.set("_private_role", canEdit);
            self.set("_private_currentUserId", data.id);
            return canEdit;
        });
    },

    getClass: function(){
        var label = "label "
        var role = this.get('role');
        if(role == "USER")
            return label + "label-primary";
        else if(role == "ADMIN")
            return label + "label-danger";
        else if(role == "READONLY_ADMIN")
            return label + "label-warning";
    }.property('role')
});