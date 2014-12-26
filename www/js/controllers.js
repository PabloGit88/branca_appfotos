angular.module('branca_appfotos.controllers', [ 'photo.services', 'branca_appfotos', 'db.services'])

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
.controller('SessionsListController', function($scope) {
	$scope.sessions = [{
		place: 'un lugar',
		date: '12/12/14',
		operator: 'Pablo',
		isSync: false
	},
	{
		place: 'otro lugar',
		date: '12/12/14',
		operator: 'McPesto',
		isSync: true
	},
	{
		place: 'bombonera',
		date: '12/12/14',
		operator: 'Dami',
		isSync: false
	},
	{
		place: 'mi casa',
		date: '12/12/14',
		operator: 'Campi',
		isSync: false
	},
	{
		place: 'changos house',
		date: '12/12/14',
		operator: 'Diego',
		isSync: true
	},
	{
		place: 'eran los permisos',
		date: '12/12/14',
		operator: 'Peti',
		isSync: false
	}];
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
		 AppContext.closeSession();
		 $location.path('/');  
	 };
	
	
	
	
	
})
.controller('NewSessionController', function($scope, AppContext,$location, mySqlDbService) {
	///session/picture/take 
	$scope.session = Session();
	$scope.saveSession = function() {
	mySqlDbService.saveSession(AppContext.getDbConnection(), $scope.session ).then(function(res) {
			console.log("NewSessionController idSession: " +  res.insertId);
			AppContext.saveSessionId( res.insertId); 
			 $location.path('/session/picture/take'); 
        }, function (err) {
            console.error(err);
        });
	
	};
})
;
