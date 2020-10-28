sap.ui.define(["sap/ui/core/format/NumberFormat"], function (NumberFormat) {
	"use strict";
	return {
		UnitStatus :  function (bStatus) {
			
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
			
		}
	};
});
