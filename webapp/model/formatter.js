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
			
        	if (iNumber) {
        		var oFloatNumberFormat = NumberFormat.getFloatInstance({
                    maxFractionDigits: 0,
                    minFractionDigits : 0,
                    groupingEnabled: true
                } , sap.ui.getCore().getConfiguration().getLocale());
        	
				return oFloatNumberFormat.format(iNumber);
        	} else{
        		return 0;
        	} 
			
		},
		PercentageFormat: function(iNumber){
			var oPercentFormat = NumberFormat.getPercentInstance({
                    maxFractionDigits: 0,
                    minFractionDigits : 2,
                    groupingEnabled: true
                });
			return oPercentFormat.format(iNumber);
		},
		ddMMyyyy: function(oDate) {
			var oDateFormat = DateFormat.getDateTimeInstance({pattern: "dd/MMM/yyyy HH:mm"});
			return oDateFormat.format(oDate);
		},
		yyyyMMdd: function(oDate) {
			var oDateFormat = DateFormat.getDateTimeInstance({pattern: "yyyyMMdd"});
			return oDateFormat.format(oDate);
		},
		
		yyyy_MM_dd: function(yyyMMdd) {
			if (yyyMMdd) {
				return yyyMMdd.substring(0,4) + "-" + yyyMMdd.substring(4,6) + "-" + yyyMMdd.substring(6,8);
			}
		}
		
	};
});