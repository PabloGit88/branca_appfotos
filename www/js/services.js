angular.module('branca_appfotos.services', [])

.factory('Session', function() {
  // Might use a resource here that returns a JSON array

  // Some fake testing data
  var sessions = [{
    id: 0
  }];

  return {
    all: function() {
      return sessions;
    },
    remove: function(session) {
      sessions.splice(sessions.indexOf(session), 1);
    },
    get: function(sessionId) {
      for (var i = 0; i < sessions.length; i++) {
        if (sessions[i].id === parseInt(sessionId)) {
          return sessions[i];
        }
      }
      return null;
    }
  }
})
;
