sap.ui.define(["sap/ui/core/format/NumberFormat", "sap/ui/core/format/DateFormat"], function(NumberFormat, DateFormat) {
	"use strict";
	return {
		TGFRStatus: function(bStatus) {

			if (bStatus) {
				return "Success";
			} else {
				return "Error";
			}
		},
		NumberFormat: function(iNumber) {

			if (iNumber) {
				var oFloatNumberFormat = NumberFormat.getFloatInstance({
					maxFractionDigits: 0,
					minFractionDigits: 0,
					groupingEnabled: true
				}, sap.ui.getCore().getConfiguration().getLocale());

				return oFloatNumberFormat.format(iNumber);
			} else {
				return 0;
			}

		},
		PercentageFormat: function(iNumber) {
			var oPercentFormat = NumberFormat.getPercentInstance({
				maxFractionDigits: 0,
				minFractionDigits: 2,
				groupingEnabled: true
			});
			return oPercentFormat.format(iNumber);
		},

		diffYear: function(oSDate, oEndDate) {

			if (oSDate && oEndDate) {
				let yearsDiff =  oEndDate.getFullYear() - oSDate.getFullYear();	
				return yearsDiff;

			}
			return "";
		},
		diffMonth: function(oSDate, oEndDate) {
			if (oSDate && oEndDate) {				
				let months =  (oEndDate.getFullYear()*12+oEndDate.getMonth())-(oSDate.getFullYear()*12+oSDate.getMonth()) + 1;
				
				return months % 12;
	
			}
			return "";
		},

		ddMMyyyy: function(oDate) {
			var oDateFormat = DateFormat.getDateTimeInstance({
				pattern: "dd/MMM/yyyy HH:mm"
			});
			return oDateFormat.format(oDate);
		},
		yyyyMMdd: function(oDate) {
			var oDateFormat = DateFormat.getDateTimeInstance({
				pattern: "yyyyMMdd"
			});
			return oDateFormat.format(oDate);
		},

		yyyy_MM_dd: function(yyyMMdd) {
			if (yyyMMdd) {
				return yyyMMdd.substring(0, 4) + "-" + yyyMMdd.substring(4, 6) + "-" + yyyMMdd.substring(6, 8);
			}
		}

	};
});