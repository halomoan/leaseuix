sap.ui.define(["sap/ui/core/format/NumberFormat","sap/ui/core/format/DateFormat"], function (NumberFormat,DateFormat) {
	"use strict";
	return {
		TGFRStatus :  function (bStatus) {
			
				if (bStatus) {
					return "Success";
				} else {
					return "Error";
				}
		},
		NumberFormat: function(iNumber){
			
			var oFloatNumberFormat = NumberFormat.getFloatInstance({
                    maxFractionDigits: 0,
                    minFractionDigits : 0,
                    groupingEnabled: true
                } , sap.ui.getCore().getConfiguration().getLocale());
        	

        
			return oFloatNumberFormat.format(iNumber);
			
		},
		ddMMyyyy: function(date) {
			var oDateFormat = DateFormat.getDateTimeInstance({pattern: "dd/MMM/yyyy HH:mm"});
			return oDateFormat.format(date);
		}
	};
});