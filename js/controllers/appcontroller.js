/**
 * Created by matthias on 30/03/2015.
 */

App.AppController = Ember.Controller.extend({

    actions : {
        logout: function(){
            App.Auth = null;
            $.removeCookie('authToken', {path:'/'})
            this.transitionToRoute('login');
        }
    }

});