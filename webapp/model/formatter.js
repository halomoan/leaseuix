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
				var time = (oEndDate.getTime() - oSDate.getTime()) / 1000;
				var year = Math.abs(Math.round((time / (60 * 60 * 24)) / 365.25));
				//var month = Math.abs(Math.round(time/(60 * 60 * 24 * 7 * 4)));
				//var days = Math.abs(Math.round(time/(3600 * 24)));
				//return "Year :- " + year + " Month :- " + month + " Days :-" + days;	
				return year;

			}
			return "";
		},
		diffMonth: function(oSDate, oEndDate) {
			if (oSDate && oEndDate) {
				oEndDate.setFullYear(oSDate.getFullYear());
				
				var time = (oEndDate.getTime() - oSDate.getTime()) / 1000;
				//var year  = Math.abs(Math.round((time/(60 * 60 * 24))/365.25));
				var month = Math.abs(Math.round(time / (60 * 60 * 24 * 7 * 4)));
				//var days = Math.abs(Math.round(time/(3600 * 24)));
				//return "Year :- " + year + " Month :- " + month + " Days :-" + days;	
				return month;
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