// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'

var db  = null;
angular.module('starter', ['ionic', 'db.services'])

.run(function($ionicPlatform, mySqlDbService) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
	db = mySqlDbService.openOrCreateDb('photo_email_branca.db');
	var sessionTableData = "id integer primary key ,name varchar(20) NOT NULL, last_name varchar(20) NOT NULL, place varchar(20) NOT NULL,  state varchar(20) NOT NULL,  city varchar(20) NOT NULL,  date date NOT NULL";
	mySqlDbService.createTableIfNotExist(db, "sessions" ,sessionTableData );
	
	var destinatariesTableData = "id_session integer primary key, uri_photo varchar(256) NOT NULL,  recipients mediumtext NOT NULL, integer synchronized";
	mySqlDbService.createTableIfNotExist(db, "session_photo" ,destinatariesTableData );
	
   });
})
