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
			
			emptyPerson = {
					firstname: '',
					lastname: '',
					email: ''
				};
			$scope.persons = [emptyPerson];

            $location.path('/session/picture/take');
        }else
        {
            popupService.openFormErrorPopup();
        }
	}
	
	$rootScope.savePersonList = $scope.savePersonList;
})
.controller('SessionsListController', function($scope, AppContext, mySqlDbService, syncService, popupService, $q) {
	
	$scope.sessions = [];
	$scope.init = function (){
		var db = AppContext.getDbConnection();
		mySqlDbService.retrieveSessions(db).then(function(res) {
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
            	sessionObject.dateCreated = item.date_created;

            	$scope.sessions.push(sessionObject);
            	
            }
		
		}, function (err) {
            console.error(err);
        });
	};
	$scope.init();

    $scope.hasSessionToSync = false;

	$scope.$watch("sessions", function(n, o)
	{
	    $scope.hasSessionToSync = false;

        angular.forEach(n, function(session, key)
        {
            if(!session.isSync && session.hasToSync)
            {
                $scope.hasSessionToSync = true;
            }
        });
    }, true );


	var success = function(session, imageUri , imageId, recipients)
	{
		var db = AppContext.getDbConnection();
		mySqlDbService.updatePhotoAsSynchronized(db, imageId , 1);
		$('.syncProgress ').hide();
	};

	var hadError = false;
	var error = function(session, imageUri , imageId, recipients){
	    hadError = true;
		console.log("ocurrio un error");
		$('.syncProgress ').hide();
	};
	
    var sessionRequestMapper = function(session)
    {
    	var  d = new Date(session.dateCreated);
    	var fechaFormateada = d.format("yyyy-mm-dd");
    	console.log(fechaFormateada);
    	var dataReq = {
			"id" : session.uuid,
			"nombre_operario" : session.operatorFirstName,
			"apellido_operario" : session.operatorLastName,
			"lugar" : session.place,
			"provincia" : session.state,
			"ciudad" : session.city,
			"fecha" : session.date,
			"fecha_creacion": fechaFormateada,
			"fuente" : "branca"
		};
		console.log("Formato fecha: " + dataReq.fecha);
		return dataReq;
	}
	
	var checkConnection = function()
	{
		if (navigator.connection.type == Connection.NONE)
		{
			popupService.openErrorConnectionPopup();
			return false;
		}
		return true;
	}	
	
	$scope.syncNew  = function(){
		if (!checkConnection()) 
				return ;
		var db = AppContext.getDbConnection();
		var saveSessionUrl = AppContext.getSaveSessionUrl();
		var promises = [];
		
		angular.forEach($scope.sessions, function(session, key)
		{
			var  syncPhotosPromise;
			var  saveSessionPromise;
			var  updateSessionAsSentPromise;
			
			
			var dataReq = sessionRequestMapper(session);
			if (session.isSync == false && session.hasToSync)
			{
				if (!session.isSent)	
				{	
					var deferred = $q.defer();
			    	var promise =  deferred.promise;
					AppContext.logToFile("sesión a sincronizar: " + session.uuid + " - " + session.operatorFirstName + " - " + session.place + " - " + session.date + " - " + session.city  );

					syncService.saveSessionPromise(saveSessionUrl, dataReq, session).then(
							function(data){
							    AppContext.logToFile("session saved");
							    console.log(data);
								mySqlDbService.updateSessionAsSentPromise(db, data.session, 1).then(
							    		function(data){
							    			data.session.isSent = 1;
							    			console.log(data);
							    			syncPhotosSession(data.session).then(
							    					function(data) {
							    						deferred.resolve(data);
							    					},
							    					function(data){
							    						deferred.reject(data);
							    					}
							    			);
							    			
							    		},
							    		function(data){
							    			console.log("Error al guardar la session : "+ data.session.uuid  + data.session.operatorFirstName + " - " + data.session.place + " - " + data.session.date + " - " + data.session.city);
							    			deferred.reject(data);
							    		}
							    );
							},
							function(err){
								AppContext.logToFile("sesion no guardada: " + err);
								console.log(err);
								deferred.reject(err);
							}
					);
					promises.push(promise);
				}
				else{
					p =  syncPhotosSession(session);
					promises.push(p);
				}
			}
			else{
				AppContext.logToFile("sesión ya sincronizada: " + session.uuid + " - " + session.operatorFirstName + " - " + session.place + " - " + session.date + " - " + session.city  );
			}
			
		});
		
		$q.all(promises).then(
				function(data){
					console.log("terminaron todas las promesas con exito " + data ); 
					popupService.openSyncSuccessPopup();
				},
				function(data){
					console.log("alguna promesa fallo : " + data);
					alert("Ocurrió un error durante la sincronización.");
					alert("Algunas sesiones podrían requerir una nueva sincronización");
				}
			);
		
	};
	
	var syncPhotosSession = function(session){
		var deferred = $q.defer();
    	var promise =  deferred.promise;
		var db = AppContext.getDbConnection();
		mySqlDbService.findPhotosForSession(db,session.id).then(
				function(res){
					var promises = []; 
					for (var i=0; i< res.rows.length; i++){
							var photo = res.rows.item(i);
							AppContext.logToFile("subiendo foto id: "  + photo.id_photo + " photo date: " + photo.date_created  );
							var p = syncService.uploadPhotoPromise(session, photo, i).then(
								function(data){
									AppContext.logToFile("Foto subida id: " + data.photo.id + " Index : " +  data.photoIndex + " actualizando db..." );
									console.log("Foto subida id: " + data.photo.id + " Index : " +  data.photoIndex + " actualizando db...");
									//Si falla esto, se va a enviar la foto nuevamente cuando se sincronice la session.
									//Habría que hacer un doble chequeo contra el server. Pero no hay método en la api
									//para volver atrás el envio.
									mySqlDbService.updatePhotoAsSynchronized(db, data.photo.id_photo  , 1);
									AppContext.logToFile("foto actualizada como sincronizada: " + data.photo.id_photo);
									//este data que reorno va a ser recibido como parámetro en el then del Q.all.
									return data;
								},
								function(data){
									AppContext.logToFile("Ocurrio un error al guardar foto. Id: " + data.photo.id_photo + ". Index : " + data.photoIndex);
									console.log("Ocurrio un error al guardar foto. Id: " + data.photo.id_photo + ". Index : " + data.photoIndex);
								}
							);
							promises.push(p);
					 }
					$q.all(promises).then(
							function(data){
								console.log("Actualizar base de datos de la sesion...");
								AppContext.logToFile("Actualizar base de datos de la sesion...");
									//Busca nuevamente las fotos para la session que no están sincronizadas.
									//Si todas están sincdronizadas. Actualizo la sesión como sincronizada.
								var id;	
								if (typeof data.session != 'undefined')
								{ 	console.log(id);	
									id = data.session.id;
								}
								else
								{
									console.log(id) ; 
									id =  session.id; 
								}
									
								mySqlDbService.countUnsynchronizedPhotos(db,id).then(
											function(res){
												console.log(res.rows.item(0));
												if ( res.rows.item(0).quantity  == 0){
													mySqlDbService.updateSessionAsSynchronized(db,id, 1).then(
															function(res){
																console.log("session actualizada: " + res);
																AppContext.logToFile("sesion guardada como actualizda: " + id);
																session.isSync = 1;
																deferred.resolve();
															},
															function(res){
																console.log("session actualizada: " + res);
																session.isSync = 0;
																AppContext.logToFile("sesion NO guardada como actualizda: " + id);
																deferred.reject("Error al guardar");
															}
													);
												}
											},
											function(res){
												deferred.reject("Error al guardar");
											}
									);
							},
							function(data){
								AppContext.logToFile("Error al subir alguna de las fotos");
								console.log("Error al subir alguna de las fotos: "  + data);
								deferred.reject("Error al subir fotos");
							}
					);
				},
				function(err){
					console.log(err);		
					AppContext.logToFile("Error al subir fotos");
					deferred.reject("Error al subir fotos");
				}
		);
		
		return promise;
	};

	var syncSessionPhotos = function(db, session)
	{
        mySqlDbService.findPhotosForSession(db, session.id).then(function(res)
        {
             for (var i=0; i< res.rows.length; i++){
                    var photo = res.rows.item(i);
                    console.log("Photo to syncronize...");
                    console.log(photo);
                    var imageUri = photo.uri_photo;
                    var recipients = photo.recipients;
                    var imageId = photo.uuid;
                    syncService.uploadPhoto(session, imageUri , imageId, recipients, success, error, i);
             }
             if (!hadError)
             {
                 mySqlDbService.updateSessionAsSynchronized(db, session.id, 1).then(function(res)
                 {
                    session.isSync = 1;
                    session.hasToSync = 0;
                 }, function(err)
                 {
                    console.log(err);
                 });
             }
        }, function (err) {
            console.error(err);
        });
	};

	$scope.syncSessions = function() 
	{
		if (!checkConnection())
            return;

		var db = AppContext.getDbConnection();
		var saveSessionUrl = AppContext.getSaveSessionUrl();

		angular.forEach($scope.sessions, function(session, key) 
		{
		    if (session.isSync == false && session.hasToSync)
        	{
        	    if(!session.isSent)
        	    {
                    var dataReq = sessionRequestMapper(session);

                    syncService.saveSession(saveSessionUrl, dataReq).success(function(data,status, headers,config )
                    {
                        console.log("data post save session:");
                        console.log(data);
                        if (data.error == false)
                        {
                            mySqlDbService.updateSessionAsSent(db, session.id, 1).then(function(res)
                            {
                                //Session synced, now SYNC PHOTOS
                                session.isSent = 1;
                                syncSessionPhotos(db, session);
                            }, function(err)
                            {
                                console.log("error to mark session as sent");
                                console.log(err);
                            });
                           
                        }//else -> hubo error... analizar que hacer.
                    }).error(function(e)
                    {
                        console.log(e);
                        console.log("error de sincronización de sesión");
                        alert("errror de sincronización de sesión. SesionId: " + session.id);
                    });
				}else
				{
				    //Session already synced, now SYNC PHOTOS
				    syncSessionPhotos(db, session);
				}
			}
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
		  sourceType: Camera.PictureSourceType.CAMERA,
		  allowEdit: true
	};
		
	camService.getPicture(options).then(
			function(imageURI) {
		  		AppContext.setImageUri(imageURI);
		  		console.log("redirecting to: /session/picture/persons" );
		    	$location.path('/session/picture/persons');  
			},
			function(err) {
		   		console.log("ERROR: " + err);
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
			if(validatorService.hasValidDate($scope.session))
			{
				mySqlDbService.saveSession(AppContext.getDbConnection(), $scope.session ).then(function(res) {
					console.log("NewSessionController idSession: " +  res.insertId);
					AppContext.saveSessionId( res.insertId); 
					$scope.session = Session();
					$location.path('/session/picture/take'); 
		        }, function (err) {
		            console.error(err);
		            alert(err);
		        });
			}
			else
			{
				alert("Fecha Inválida");
			}
		}else{
			popupService.openFormErrorPopup();
		}
	};
})
;
