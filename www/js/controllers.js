angular.module('branca_appfotos.controllers', [ 'photo.services', 'branca_appfotos', 'db.services', 'validation.services', 'popup.services', 'sync.services'])

.controller('PicturePersonsController', function($scope , AppContext , $location, mySqlDbService) {
	var emptyPerson = {
		firstname: '',
		lastname: '',
		email: ''
	};
	
	
	$scope.persons = [emptyPerson];
	
	$scope.addPerson = function($event, $index) 
	{ 
		if($index == $scope.persons.length-1)
		{
			$event.toElement.src = "img/deleteRowButton.png";
			$scope.persons.push({
				firstname: '',
				lastname: '',
				email: ''
			}); 
		}else {
			$scope.persons.splice($index+1, 1);
		}
	};
	
	$scope.savePersonList = function( ) 
	{
		var recipientsList = "";
		angular.forEach($scope.persons, function(person, key) {
			//AppContext.savePerson(person);
			recipientsList = recipientsList + person.firstname + ';'+ person.lastname + ';'+ person.email  + ',';
		
		});
		var db =  AppContext.getDbConnection();
		var imageUri = AppContext.getImageUri();
		var sesssionId = AppContext.getSessionId();
		console.log("Saving Photo : " + imageUri +  " -  " + sesssionId +  "  - " +  recipientsList);
		mySqlDbService.savePhoto(db , imageUri , sesssionId, recipientsList , 0);
		$location.path('/session/picture/take');  
	}
	
})
.controller('SessionsListController', function($scope, AppContext, mySqlDbService, syncService) {
	
	$scope.sessions = [];
	$scope.init = function (){
		var db = AppContext.getDbConnection();
		mySqlDbService.retrieveSessions(db).then(function(res) {
            console.log("select session result  -> " + res);
            for (var i=0; i< res.rows.length; i++){
            	var sessionObject = Session();
            	var item = res.rows.item(i);
            	sessionObject.operatorFirstName = item.name;
            	sessionObject.operatorLastName = item.last_name;
            	sessionObject.city = item.city;
            	sessionObject.place = item.place;
            	sessionObject.state =  item.state;
            	sessionObject.date = item.date;
            	sessionObject.id = item.id;
            	sessionObject.isSync = item.isSync;
            	console.log("Session Object: " + sessionObject);
            	$scope.sessions.push(sessionObject);
            }
		
		}, function (err) {
            console.error(err);
        });
	};
	$scope.init();
	
	
	var success  =  function(session, imageUri , imageId, recipients){
		var db = AppContext.getDbConnection();
		mySqlDbService.updatePhotoAsSynchronized(db, imageId , 1;
	};
	
	var hadError = false;
	var error   = function(session, imageUri , imageId, recipients){
		 hadError = true;
		console.log("ocurrio un error");
	};
	
	
	$scope.syncSessions = function() {
		// /
		var db = AppContext.getDbConnection();
		var saveSessionUrl = AppContext.getSaveSessionUrl();
		
		angular.forEach($scope.sessions, function(session, key) {
			var dataReq = {
				"deviceId" : 654654564,
				"sessionId" : session.id,
				"operatorFirstName" : session.operatorFirstName,
				"operatorLastName" : session.operatorLastName,
				"place" : session.place,
				"state" : session.state,
				"city" : session.city,
				"date" : session.date,
			};
			if (session.isSync == false){
				syncService.saveSession(saveSessionUrl, dataReq).success(function(data,status, headers,config ){
					//TODO : Validar que la sesión no se guarde multiples veces. 
					console.log("data post save session:");
					console.log(data);
					if (data.error == false ){
							mySqlDbService.findPhotosForSession(db,session.id).then(function(res) {
								 for (var i=0; i< res.rows.length; i++){
										var item = res.rows.item(i); 
										console.log(item);
										var imageUri = item.uri_photo;
										var recipients = item.recipients;
										var imageId = item.id_photo;
										syncService.uploadPhoto(session, imageUri , imageId, recipients, success, error );
								 }
								 if ( !hadError){
									 //mySqlDbService.updateSessionAsSynchronized(db, session.id, 1);
									 hadError = false;
								 }
							}, function (err) {
					            console.error(err);
					        });
					}//else -> hubo error... analizar que hacer.
				}).error(
					function(){
						console.log("error de sincronización de sesión");
						alert("errror de sincronización de sesión. SesionId: " + session.id);
					}
				);
			}
		});
	};

})
.controller('TakePhotoController', function($scope, camService, AppContext,$location) {
	 $scope.takePhoto = function() {
	      var options = {
		  quality: 75,
		  targetWidth: 320,
		  targetHeight: 320,
		  saveToPhotoAlbum: true,
		  destinationType: Camera.DestinationType.FILE_URI,
		  encodingType: Camera.EncodingType.JPEG,
		  sourceType: Camera.PictureSourceType.CAMERA
		};
		
		camService.getPicture(options).then(
		function(imageURI) {
		  	AppContext.setImageUri(imageURI);
		  	console.log("redirecting to: /session/picture/persons" );
		    $location.path('/session/picture/persons');  
		},
		function(err) {
		   alert("Por favor, intente nuevamente.");
		}
		);
	};
	
	 $scope.closeSession = function() {
		 console.log("Session Closed.");
		 AppContext.closeSession();
		 $location.path('/');  
	 };
})
.controller('NewSessionController', function($scope, AppContext,$location, mySqlDbService, sessionValidator, popupService) {
	///session/picture/take 
	$scope.session = Session();
	
	$scope.saveSession = function(e) 
	{
		event.preventDefault();
		if (sessionValidator.validate($scope.session)) 
		{	
			mySqlDbService.saveSession(AppContext.getDbConnection(), $scope.session ).then(function(res) {
				console.log("NewSessionController idSession: " +  res.insertId);
				AppContext.saveSessionId( res.insertId); 
				$scope.session = Session();
				$location.path('/session/picture/take'); 
	        }, function (err) {
	            console.error(err);
	        });
		}else{
			popupService.openFormErrorPopup();
		}
	};
})
;
