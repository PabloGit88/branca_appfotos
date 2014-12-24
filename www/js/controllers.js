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
;
