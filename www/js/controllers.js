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
	    if(true)
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
            console.log(AppContext.getCurrentSessionPhotos());

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
            	sessionObject.isSent = item.isSent;
            	console.log("Session Object: " + sessionObject);
            	$scope.sessions.push(sessionObject);
            }
		
		}, function (err) {
            console.error(err);
        });
	};
	$scope.init();
	
	var updateSessionSyncronization= function(session, isSync){
		 console.log("fotos subidas correctamente sincronizando.");
		 mySqlDbService.updateSessionSyncronization(db, session.id, isSync).then(
				 function(res){
					session.isSync = 1;
					session.hasToSync = 0;
				 },
				 function(err){
					 console.log(err);
				 });
	}
	
	
	var uploadPhotosSuccess  =  function(session, imageUri , imageId, recipients, quantityToSend , sentOk)
	{
		sentOk.quantity++;
		var db = AppContext.getDbConnection();
		mySqlDbService.updatePhotoSynchronization(db, imageId , 1).then(
			function(res) { 
				$('.syncProgress ').hide();
			
			},
			function(err){
				console.error(err);
			}
		);
		if (sentOk.quantity == quantityToSend){
			updateSessionSyncronization(session, 1);
		}
	};
	
	var uploadPhotosError  = function(){
		console.log("ocurrio un error");
		$('.syncProgress ').hide();
		alert("Ocurrio un error en la sincronización de una de las fotos.");
		session.isSync = 0 ;
		//hubo un error al subir una foto, entonces la sesión todavia se puede sincronizar.
		updateSessionSyncronization(session, 0);
	};
	
	var sendPhotos = function( session){
		//object in order to pass by reference.
		var sentOk = { quantity : 0 };
		mySqlDbService.findPhotosForSession(db,session.id).then(function(res) {
			if (res.rows.length == 0 ) 
				{
					session.isSync = 1;
					session.hasToSync = 0;
				}
			
			
			for (var i=0; i< res.rows.length; i++){
				 	var photo = res.rows.item(i); 
					console.log(photo);
					var imageUri = photo.uri_photo;
					var recipients = photo.recipients;
					var imageId = photo.id_photo;
					syncService.uploadPhoto(session, imageUri , imageId, recipients, uploadPhotosSuccess(session,imageUri,imageId, recipients, res.rows.length ,sentOk), uploadPhotosError, i);
			 }
		}, function (err) {
            console.error(err);
        });
	};
	
	var sendAllPhotosSync = function( session){
		//object in order to pass by reference.
		var sentOk = { quantity : 0 };
		var returnData = {error : false };
		var sqlResult = mySqlDbService.findPhotosForSessionAsync(db,session.id);
		var sendPhotoResult;
		if (sqlResult.error = false ){
			var res = sqlResult.res;
			for (var i=0; i < res.rows.length; i++)
			{
			 	var photo = res.rows.item(i); 
				console.log(photo);
				var updateResult = mySqlDbService.updatePhotoSynchronizationAsync(db, imageId , 1);
				if (updateResult.error == false )
				{// actualizo db --> entonces envio (para poder cancelar en caso de error luego)
					sendPhotoResult = sendOnePhotoAsync(session, photo, i);
					if (sendPhotoResult.error == true){
						mySqlDbService.updatePhotoSynchronizationAsync(db, imageId , 0);
						returnData.error = true;
						return returnData;
					}
				}
				else{
					returnData.error = true;
					return returnData;
				}
			}
		}
		else 
		{
			returnData.error = true;
		}
		
		return returnData;
	};
	
	var sendOnePhotoAsync = function (session, photo, photoIndex)
	{
		var hasSent = false; 
		var isSending = true;
		var returnData = {
							error : false,
							error : '',
						 };
		while(isSending)
		{
			if (!hasSent )
			{
				hasSent = true;
				syncService.uploadPhotoAsync(session, photo,  photoIndex).then(
						function(e){
							isSending = false;
						},
						function(error){
							console.log(error);
							isSending = false;
							returnData.error = true;
							returnData.errorMessage = error;
						}
				);
			}
		}
		return returnData;
	};
	
	
	var dataRequestMapper = function(session){
		return {
				"deviceId" : AppContext.getDeviceUUID(),
				"sessionId" : session.id,
				"operatorFirstName" : session.operatorFirstName,
				"operatorLastName" : session.operatorLastName,
				"place" : session.place,
				"state" : session.state,
				"city" : session.city,
				"date" : session.date,	
			};
	};
	
	$scope.syncSessions = function() {
		// /
		
		if (  navigator.connection.type == Connection.NONE)
			{
				alert("Necesita conexión a internet para poder sincronizar.");
				return;
			}
		
		var db = AppContext.getDbConnection();
		var saveSessionUrl = AppContext.getSaveSessionUrl();

		angular.forEach($scope.sessions, function(session, key) {
			var dataReq = dataRequestMapper(session);
				if (session.hasToSync){
					if ( session.isSent == 0 )
					{	
						syncService.saveSession(saveSessionUrl, dataReq).success(function(data,status, headers,config ){
							console.log("data post save session: " + data);
							if (data.error == false ){
								mySqlDbService.updateSessionSending(db, session.id, 1).then(
										 function(res){
												session.isSent = 1;
												sendPhotos(session);
											 },
											 function(err){
												 console.log(err);
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
					else {
						sendPhotos(session);
					}
				}
			}
		);

		popupService.openSyncSuccessPopup();
	};
	
	$scope.syncSessionsAsync = function() {
		
		if (  navigator.connection.type == Connection.NONE)
		{
			alert("Necesita conexión a internet para poder sincronizar.");
			return;
		}
		
		var syncResult = { errorPhotoSyncronization : false,
					       errorSessionSyncronization : false,
						 };
		var db = AppContext.getDbConnection();
		var saveSessionUrl = AppContext.getSaveSessionUrl();
		var keepFor = true;
		for ( i = 0 ; i < $scope.sessions.length && keepFor == true ; i++ )
		{
			session = $scope.sessions[i];
			var dataReq = dataRequestMapper(session);
				if (session.hasToSync){
					if ( session.isSent == 0 )
					{	
						var saveResult = syncService.saveSessionAsync(saveSessionUrl, dataReq);
						if (saveResult.error == false)
						{
							var updateSessionResult = mySqlDbService.updateSessionSendingAsync(db, session.id, 1);
							if (updateSessionResult.error == true)
							{
								syncResult.errorSessionSyncronization = true;
							}
							else{
								session.isSent = 1;
							}
						}
						else
						{
							syncResult.errorSessionSyncronization = true;
							keepFor = false;
						}
					}
					if (syncResult.errorSessionSyncronization == false){
						var result  = sendAllPhotosSync(session);
						if (result.error == true){
							syncResult.errorPhotoSyncronization = true;
							keepFor = false;
						}
						else{
							updateSessionSyncronizationAsync(db, session.id, 1);
							
						}
					}
				}
			}
		if (syncResult.errorPhotoSyncronization == false &&  syncResult.errorPhotoSyncronization == false){
			popupService.openSyncSuccessPopup();
		}
	};

})
.controller('TakePhotoController', function($scope, camService, AppContext,$location) 
{
	$scope.init = function () {
		console.log("init: " + AppContext.getCurrentSessionPhotos());
		 $scope.currentSessionPhotos = 0;
	};
	
	$scope.init();
	
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
		  	$scope.currentSessionPhotos++;
		    $location.path('/session/picture/persons');  
		},
		function(err) {
		   console.log(err);
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
