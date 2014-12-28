angular.module('validation.services', [])

.factory('validatorService', function()
{
	return {
		validateSession: function(session)
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
		},
		validatePersonsList: function(personsList)
        {
            var isValid = true;

            angular.forEach(personsList, function(person, key)
            {
                if(
                   person.firstname != undefined && person.firstname.trim() != '' &&
                   person.lastname != undefined && person.lastname.trim() != '' &&
                   person.email != undefined && person.email.trim() != ''
                )
                {}else
                {
                   isValid = false;
                }
            });

            return isValid;
        }
	};
});