//App router
define(['jquery','underscore','backbone'],function($, _, Backbone) {

    

    var AppRouter = Backbone.Router.extend({

     // Hash maps for routes
     routes : {
      "" : "index",
    },

    initialize: function() {
      //SET ALL LISTS MODELS,ETC.
    },

    index: function() {
      console.log("index called");
      $('.content').html('eyyyyyyyyyyyyyyyyy');
    },

    fourOfour: function(error) {
      $('#content').html('page does not exists');
    }
});

return AppRouter;
});
