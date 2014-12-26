angular.module('validation.services', [])

.factory('sessionValidator', function() 
{
	return {
		validate: function(session)
		{
			if(
				session.operatorFirstName != undefined && session.operatorFirstName.trim() != '' &&
				session.operatorLastName != undefined && session.operatorLastName.trim() != '' &&
				session.place != undefined && session.place.trim() != '' &&
				session.state != undefined && session.state.trim() != '' &&
				session.city != undefined && session.city.trim() != '' &&
				session.day != undefined && session.day.trim() != '' &&
				session.month != undefined && session.month.trim() != '' &&
				session.year != undefined && session.year.trim() != ''
			)
			{
				return true;
			}else
			{
				return false;
			}
		}
	};
});