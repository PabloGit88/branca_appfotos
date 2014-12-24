// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('photoApp', ['ionic', 'photo.services'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
})



.controller('takePhotoController', function($scope, camService) {
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
			  console.log(imageURI);
			  $scope.lastPhoto = imageURI;
			  alert(imageURI);
			  camService.upload(imageURI);
			},
			function(err) {
			  console.err(err);
			  alert("error");
			}
			);
		};
})

