jQuery.sap.declare("util.Formatter");

jQuery.sap.require("sap.ui.core.format.DateFormat");

util.Formatter = {
	
	/**
	 * Formats date field from standard SAP format to 'dd-MMM-yyyy'
	 */
	DateDdMonYyyy : function (value) {
		if (value) {
		   // Custom date formatting has been applied, if the standard dateFormat class is used, it reduces the day by 1
//		    var sptdate = String(value).split("-");
//		    var myMonth = sptdate[1];
//		    var myDay = sptdate[2];
//		    var myYear = sptdate[0];
//		    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
		    var myMonth = String(value).substr(4,2);
		    var myDay	= String(value).substr(6);
		    var myYear	= String(value).substr(0,4);
//		    var combineDatestr = myDay + "-" + months[myMonth - 1] + "-" + myYear;
		    var combineDatestr = myMonth + "/" + myDay + "/" + myYear;
		    var dateFormat = this.getParent().getParent().getParent().getController().getOwnerComponent().getModel("userFormatting").oData.DateFormat;
		    dateFormat = dateFormat.replace("dd",myDay);
		    dateFormat = dateFormat.replace("MM",myMonth);
		    dateFormat = dateFormat.replace("YYYY",myYear);
		    return dateFormat;
		    
		} else {
			return value;
		}
	},
	
	RemoveDecimals : function (value) {
		if (value) {
			var toInteger = parseInt(value);
			return String(toInteger);
		} else {
			return value;
		}
	},
	
	/**
	 * Formats date field from standard SAP format to 'dd-MMM-yyyy' from TimeStamp
	 */
	DateFromTimeStamp : function (value) {
		if (value) {
			//value = value.split("T");
			//var oDateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({pattern: "dd-MMM-yyyy"}); 
			/*var oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({pattern: "MM-dd-yyyy"});
			var formattedDate =  oDateFormat.format(new Date(value[0]));
			return formattedDate;*/
			
		   // Custom date formatting has been applied, if the standard dateFormat class is used, it reduces the day by 1
		   // Date Value is like Thu Jan 08 2015 13:30:00 GMT+0530
		    var sptdate = String(value).split(" ");
		    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
		    var myMonth = sptdate[1];
		    var myDay = sptdate[2];
		    var myYear = sptdate[3];
		    var index = months.indexOf(myMonth) + 1;
		    if (index < 10)
		    	var indMonth = "0" + index;
		    var combineDatestr = indMonth + "/" + myDay + "/" + myYear;
		    return combineDatestr;
		    
		} else {
			return value;
		}
	}
	
};