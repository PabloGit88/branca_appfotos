var Session = (function () {
	
  	//Immediately returns an anonymous function which builds our modules 
  	return function (operatorFirstName, operatorLastName, place,  city , state, day, month, year, isSync,date, id, uuid, isSent) {        
        
       console.log("Create Session called with " + operatorFirstName + "...");
	   return {
	    operatorFirstName :  operatorFirstName,
		operatorLastName :  operatorLastName,
		place :  place,
		state :  state,
		city :  city,
		day :  day,
		month :  month,
		year :  year,
		isSync : isSync,
		date : date, 
		id: id,
		uuid: uuid,
		hasToSync : 0,
		isSent : isSent,
	 }
  }
})();