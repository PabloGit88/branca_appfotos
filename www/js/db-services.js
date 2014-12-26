angular.module('db.services', ['ngCordova'])
.factory('mySqlDbService', ['$q','$cordovaSQLite', function($q, $cordovaSQLite) {
   return {
	
	   openOrCreateDb : function(dbName){
		 var db = null;
		 db = $cordovaSQLite.openDB(dbName);
		 return db;
	},
	createTableIfNotExist: function( db , tableName , tableData){
	   // example: CREATE TABLE IF NOT EXISTS people (id integer primary key, firstname text, lastname text)
	   $cordovaSQLite.execute(db, "CREATE TABLE IF NOT EXISTS "  + tableName +  " ( " +  tableData  + " )" );
	},
	
	saveSession : function(db, session){
		var date = session.day + "/" + session.month + "/" + session.year;
		var statement = "INSERT INTO sessions(name, last_name, place, state, city, date  ) VALUES ( ?,?,?,?,?,?)";
		return  $cordovaSQLite.execute(db,statement , [session.operatorFirstName, session.operatorLastName, session.place, session.state, session.city, date ]);
	},
	
	savePhoto : function(db , imageUri , sesssionId, recipients , syncronized ){
		var statement = "INSERT INTO session_photo( uri_photo, id_session, recipients, synchronized ) VALUES ( ?,?,?,?)";
		$cordovaSQLite.execute(db,statement , [imageUri, sesssionId, recipients, syncronized ]).then(function(res) {
            console.log("INSERT ID -> " + res.insertId);
        }, function (err) {
            console.error(err);
        });
	}
	
	
	
	
	
 }
}])