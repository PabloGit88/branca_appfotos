angular.module('branca_appfotos.controllers', [ 'photo.services', 'branca_appfotos', 'db.services', 'validation.services', 'popup.services', 'sync.services'])

.controller('PicturePersonsController', function($scope, $rootScope, AppContext , $location, mySqlDbService, validatorService, popupService) {
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
			if($index == $scope.persons.length-1)
			{				
				$event.toElement.src = "img/addRowButton.png";
			}
		}
	};
	
	$scope.savePersonList = function( event )
	{
        event.preventDefault();
	    if(validatorService.validatePersonsList($scope.persons))
	    {
			popupService.closePopup();
            var recipientsList = "";
            angular.forEach($scope.persons, function(person, key) {
                //AppContext.savePerson(person);
                recipientsList = recipientsList + person.firstname + ','+ person.lastname + ','+ person.email  + ';';

            });
            var db =  AppContext.getDbConnection();
            var imageUri = AppContext.getImageUri();
            var sesssionId = AppContext.getSessionId();
            console.log("Saving Photo : " + imageUri +  " -  " + sesssionId +  "  - " +  recipientsList);

            mySqlDbService.savePhoto(db , imageUri , sesssionId, recipientsList , 0);
            
			AppContext.incrementCurrentSessionPhotos();
			$rootScope.currentSessionPhotos = AppContext.getCurrentSessionPhotos();
			
			$scope.persons = [emptyPerson];

            $location.path('/session/picture/take');
        }else
        {
            popupService.openFormErrorPopup();
        }
	}
	
	$rootScope.savePersonList = $scope.savePersonList;
})
.controller('SessionsListController', function($scope, AppContext, mySqlDbService, syncService, popupService) {
	
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
				sessionObject.uuid = item.uuid;
            	sessionObject.isSync = item.isSync;
            	console.log("Session Object: " + sessionObject);
            	$scope.sessions.push(sessionObject);
            }
		
		}, function (err) {
            console.error(err);
        });
	};
	$scope.init();
	
	
	var success  =  function(session, imageUri , imageId, recipients)
	{
		var db = AppContext.getDbConnection();
		mySqlDbService.updatePhotoAsSynchronized(db, imageId , 1);
		$('.syncProgress ').hide();
	};
	
	var hadError = false;
	var error   = function(session, imageUri , imageId, recipients){
		 hadError = true;
		console.log("ocurrio un error");
		$('.syncProgress ').hide();
	};
	
	
	$scope.syncSessions = function() 
	{
		if (  navigator.connection.type == Connection.NONE)
			{
				popupService.openErrorConnectionPopup();
				return;
			}
		
		var db = AppContext.getDbConnection();
		var saveSessionUrl = AppContext.getSaveSessionUrl();
		
		angular.forEach($scope.sessions, function(session, key) 
		{
			var dataReq = {
				"id" : session.uuid,
				"nombre_operario" : session.operatorFirstName,
				"apellido_operario" : session.operatorLastName,
				"lugar" : session.place,
				"provincia" : session.state,
				"ciudad" : session.city,
				"fecha" : session.date,	
			};
			if (session.isSync == false && session.hasToSync)
			{
				syncService.saveSession(saveSessionUrl, dataReq).success(function(data,status, headers,config ){
					//TODO : Validar que la sesión no se guarde multiples veces. 
					console.log("data post save session:");
					console.log(data);
					if (data.error == false ){
							mySqlDbService.findPhotosForSession(db,session.id).then(function(res) {
								 for (var i=0; i< res.rows.length; i++){
										var photo = res.rows.item(i); 
										console.log(photo);
										var imageUri = photo.uri_photo;
										var recipients = photo.recipients;
										var imageId = photo.uuid;
										syncService.uploadPhoto(session, imageUri , imageId, recipients, success, error, i);
								 }
								 if ( !hadError){
									 console.log("fotos subidas correctamente sincronizando.");
									 mySqlDbService.updateSessionAsSynchronized(db, session.id, 1).then(
											 function(res){
												session.isSync = 1;
												session.hasToSync = 0;
											 },
											 function(err){
												 console.log(err);
											 });
								 }
							}, function (err) {
					            console.error(err);
					        });
					}//else -> hubo error... analizar que hacer.
				}).error(
					function(e){
						console.log(e);
						console.log("error de sincronización de sesión");
						alert("errror de sincronización de sesión. SesionId: " + session.id);
					}
				);
			}
			hadError = false;
		});

		popupService.openSyncSuccessPopup();
	};

})
.controller('TakePhotoController', function($scope, $rootScope, camService, AppContext,$location) 
{
	$rootScope.currentSessionPhotos = AppContext.getCurrentSessionPhotos();
	
	$scope.takePhoto = function() {
	      var options = {
		  quality: 100,
		  targetWidth: 600,
		  targetHeight: 1024,
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
	
	$scope.closeSession = function() 
	{
		console.log("Session Closed.");
		AppContext.closeSession();
		$rootScope.currentSessionPhotos = AppContext.getCurrentSessionPhotos();
		
		$location.path('/');  
	 };
})
.controller('NewSessionController', function($scope, AppContext,$location, mySqlDbService, validatorService, popupService) {
	///session/picture/take 
	$scope.session = Session();
	
	$scope.saveSession = function(e) 
	{
		event.preventDefault();
		if (validatorService.validateSession($scope.session))
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
