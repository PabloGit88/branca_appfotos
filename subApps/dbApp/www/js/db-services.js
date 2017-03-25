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
	}
 }
}])