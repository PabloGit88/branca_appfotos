var Session = (function () {

  //Immediately returns an anonymous function which builds our modules 
  return function (operatorFirstName, operatorLastName, place,  city , state, day, month, year) {        
        
        console.log("Create Session called with " + operatorFirstName + "...");
        
        var localOperatorFirstName = operatorFirstName;
		var localOperatorLastName = operatorLastName;
		var localPlace  = place;
		var localState = state ;
		var localCity = city;
		var localDay = day;
		var localMonth = month;
		var localYear = year;

	   return {
	   
	    operatorFirstName :  operatorFirstName,
		operatorLastName :  operatorLastName,
		place :  place,
		state :  state,
		city :  city,
		day :  day,
		month :  month,
		year :  year
	 }
      
  }
})();