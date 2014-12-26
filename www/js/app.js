// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js

var db = null;

angular.module('branca_appfotos', ['ionic', 'branca_appfotos.controllers', 'db.services'])

.run(function($ionicPlatform, mySqlDbService, AppContext) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
    
    db = mySqlDbService.openOrCreateDb('photo_email_branca.db');
	
    var sessionTableData = "id integer primary key ,name varchar(20) NOT NULL, last_name varchar(20) NOT NULL, place varchar(20) NOT NULL,  state varchar(20) NOT NULL,  city varchar(20) NOT NULL,  date date NOT NULL";
	mySqlDbService.createTableIfNotExist(db, "sessions" ,sessionTableData );
	
	var destinatariesTableData = "id_session integer primary key, uri_photo varchar(256) NOT NULL,  recipients mediumtext NOT NULL, integer synchronized";
	mySqlDbService.createTableIfNotExist(db, "session_photo" ,destinatariesTableData );
	
	AppContext.setDbConnection(db);
    
  });
})

.config(function($stateProvider, $urlRouterProvider) {

	// Ionic uses AngularUI Router which uses the concept of states
  	// Learn more here: https://github.com/angular-ui/ui-router
  	// Set up the various states which the app can be in.
  	// Each state's controller can be found in controllers.js
  	$stateProvider

  	// Each tab has its own nav history stack:
	.state('home', {
		url: '/',
   		templateUrl: 'templates/home.html'
  	})
  	.state('session', {
    	url: '/session'
  	})
	.state('session_new', {
    	url: '/session/new',
    	templateUrl: 'templates/session_new.html',
    	controller: 'NewSessionController'
  	})
  	.state('session_home', {
    	url: '/session/home',
    	templateUrl: 'templates/session_home.html',
  	})
	.state('session_take_picture', {
    	url: '/session/picture/take',
    	templateUrl: 'templates/session_take_picture.html',
    	controller: 'TakePhotoController'
  	})
	.state('session_picture_persons', {
    	url: '/session/picture/persons',
    	templateUrl: 'templates/session_picture_persons.html',
		controller: 'PicturePersonsController'
  	})
	.state('sessions_list', {
    	url: '/sessions/list',
    	templateUrl: 'templates/sessions_list.html',
		controller: 'SessionsListController'
  	})
  	;

  	// if none of the above states are matched, use this as the fallback
  	$urlRouterProvider.otherwise('/');
}).factory('AppContext', function () {

    var data = {
        ImageUri: '',
        PersonStringList: '',
        DbConnection : '',
    };

    return {
        getImageUri: function () {
            return data.ImageUri;
        },
        setImageUri: function (imageUri) {
            data.ImageUri = imageUri;
        },
        getDbConnection : function(){
        	return data.DbConnection;
        },
        
        setDbConnection : function (dbConnection){
        	data.DbConnection = dbConnection;
        },
        
        savePerson : function(person)
        {        
        	//data.PersonList =  data.PersonList + person.t
        	if ( person.firstname != '' &&   person.lastname != '' &&  person.email != ''  )
        	{
        		data.PersonStringList  = data.PersonStringList + person.firstname + ';'+ person.lastname + ';'+ person.email  + ',';
        		console.log(data.PersonStringList);
        	}
        },
    };
});
