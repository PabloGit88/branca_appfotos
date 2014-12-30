angular.module('sync.services', ['ngCordova'])

.factory('syncService', ['mySqlDbService', '$http', function(mySqlDbService, $http) {
	  return {
		  uploadPhoto : function (session, imageUri, imageId, recipients, success , error, photoIndex)
		  {
		    	console.log("Sincronizando sessión: " + session.id );
		    	var ft = new FileTransfer();
		        var options = new FileUploadOptions();
		
		        options.fileKey = "foto";
		        options.fileName = 'foto.jpg'; // We will use the name auto-generated by Node at the server side.
		        options.mimeType = "image/jpeg";
		        var serverURL = encodeURI('http://www.odiseo.com.ar/projects/brancaAppPhotos/guardar-foto.php'); //encodeURI('http://test3.bblabs.com.ar/playup_fotos_2015/web/api/guardar-foto');
		        options.params = {"sesion_id" : session.uuid , "id": imageId,   "fecha_creacion" : session.date , "cadena_personas" : recipients };
				ft.onprogress = function(progressEvent) 
				{
    				if (progressEvent.lengthComputable) 
    				{
    					var percentage = Math.floor(progressEvent.loaded / progressEvent.total * 100);
    					$('.syncProgress span').html('Sincronizando foto '+(photoIndex+1)+' de la sesión: '+percentage+'%');
    				} else {
      					$('.syncProgress span').html('Sincronizando foto '+(photoIndex+1)+' de la sesión.');
    				}
    				
    				$('.syncProgress ').show();
				};
		        ft.upload(imageUri, serverURL,
				            function (e) {
				               console.log("imagen sincronizada.");
				               $('.syncProgress ').hide();
				               success(session, imageUri, imageId, recipients);
				         	},
				            function (e) {
				         		console.log("Upload failed");
				            	console.log(e);
				            	$('.syncProgress ').hide();
				            		error(session, imageUri, imageId, recipients);
				            }, options);
	     },
	    
	    saveSession : function (url , dataReq){
	    	var req = {
	    			 method: 'POST',
	    			 url: url,
	    			 data: jQuery.param(dataReq) ,
	    			 headers: {'Content-Type': 'application/x-www-form-urlencoded'}
	    	};
	    	return $http(req);
	       	//.success(function(){...}).error(function(){...});
	   },
	  };
  }
])