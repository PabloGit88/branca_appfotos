angular.module('db.services', ['ngCordova'])
.factory('mySqlDbService', ['$q','$cordovaSQLite', function($q, $cordovaSQLite) {
   return {
	
	   openOrCreateDb : function(dbName){
		 var db = null;
		 db = $cordovaSQLite.openDB(dbName);
		 return db;
	},
	generateUuid: function()
	{
		function S4() {
		    return (((1+Math.random())*0x10000)|0).toString(16).substring(1); 
		}

		// then to call it, plus stitch in '4' in the third group
		return (S4() + S4() + "-" + S4() + "-4" + S4().substr(0,3) + "-" + S4() + "-" + S4() + S4() + S4()).toLowerCase();
	},
	createTableIfNotExist: function( db , tableName , tableData){
	   // example: CREATE TABLE IF NOT EXISTS people (id integer primary key, firstname text, lastname text)
	   $cordovaSQLite.execute(db, "CREATE TABLE IF NOT EXISTS "  + tableName +  " ( " +  tableData  + " )" );
	},
	
	saveSession : function(db, session){
		
		//var date = session.day + "/" + session.month + "/" + session.year;
		//nuevo formato pedido
		var date = session.year + "-" + session.month + "-" + session.day;
		var uuid = this.generateUuid();
		console.log("Session uuid generated: "+uuid);
		var statement = "INSERT INTO sessions(uuid, name, last_name, place, state, city, date ,isSync,date_created ) VALUES (?,?,?,?,?,?,?,?, datetime())";
		return  $cordovaSQLite.execute(db,statement , [uuid, session.operatorFirstName, session.operatorLastName, session.place, session.state, session.city, date , 0 ]);
	},
	
	savePhoto : function(db , imageUri , sesssionId, recipients , isSync )
	{
		var uuid = this.generateUuid();
		console.log("Photo uuid generated: "+uuid);
		var statement = "INSERT INTO session_photo(uuid, uri_photo, id_session, recipients, isSync, date_created ) VALUES (?,?,?,?,?,  datetime() )";
		$cordovaSQLite.execute(db,statement , [uuid, imageUri, sesssionId, recipients, isSync ]).then(function(res) {
            console.log("INSERT ID -> " + res.insertId);
        }, function (err) {
            console.error(err);
        });
	},
	

	retrieveSessions : function(db) {
		var statement = "select * from sessions";
		return $cordovaSQLite.execute(db,statement , []);
	},
	
	findPhotosForSession : function( db, sessionId){
		var statement = "SELECT id_photo, uuid, uri_photo, id_session,recipients, date_created,  isSync	FROM session_photo where id_session = ? and isSync = ?";
		return $cordovaSQLite.execute(db,statement , [sessionId, 0]);
	},
	
	countUnsynchronizedPhotos : function( db, sessionId){
		var statement = "SELECT count(*)  as quantity FROM session_photo where id_session = ? and isSync = ?";
		return $cordovaSQLite.execute(db,statement , [sessionId, 0]);
	},
	
	updatePhotoAsSynchronized : function(db, idPhoto, isSync){
		var statement = "UPDATE session_photo SET isSync = ? where id_photo = ?";
		return $cordovaSQLite.execute(db,statement , [isSync, idPhoto]);
	},
	
	updateSessionAsSynchronized : function(db, idSession, isSync){
		var statement = "UPDATE sessions SET isSync = ? where id = ?";
		return $cordovaSQLite.execute(db,statement , [isSync, idSession]);
	},

	updateSessionAsSent : function(db, idSession, isSent){
    	var statement = "UPDATE sessions SET isSent = ? where id = ?";
    	return $cordovaSQLite.execute(db,statement , [isSent, idSession]);
    },
    
	updateSessionAsSentPromise : function(db, session, isSent){
		var data ={
				session : session,
				err : "",
		};
		
		var deferred = $q.defer();
    	var promise =  deferred.promise; 
		var statement = "UPDATE sessions SET isSent = ? where id = ?";
    	$cordovaSQLite.execute(db,statement , [isSent, session.id]).then(
    			function(res){
    				deferred.resolve(data);
    			},
    			function(err){
    				data.err = err;
    				deferred.reject(data);
    			}
    	);
    	return promise;
	
	},
 }
}])