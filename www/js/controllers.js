angular.module('branca_appfotos.controllers', [])

.controller('PicturePersonsController', function($scope) {
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
			$scope.persons.splice($index, 1);
		}
	}
})
;
