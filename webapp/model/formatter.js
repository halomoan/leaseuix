sap.ui.define(["sap/ui/core/format/NumberFormat", 
	//"sap/ui/core/format/DateFormat",
	"refx/leaseuix/libs/moment"], function(NumberFormat,momentjs) {
	"use strict";
	/* global moment:true */
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

		diffYear: function(oSDate, oEDate) {

			var oEndDate = moment(oEDate).add(1,'days');
			var startDate = moment(oSDate);
			var endDate = moment(oEndDate);
		
			
			var years = Math.round(endDate.diff(startDate, 'months') / 12,0);
			
			return years;
		},
		diffMonth: function(oSDate, oEDate) {
		
			var oEndDate = moment(oEDate).add(1,'days');
			var startDate = moment(oSDate);
			var endDate = moment(oEndDate);
			
			var months = Math.round(endDate.diff(startDate, 'months') % 12,0);
			return months;
		},

		ddMMyyyy: function(oDate) {
			// var oDateFormat = DateFormat.getDateTimeInstance({
			// 	pattern: "dd/MMM/yyyy HH:mm"
			// });
			// return oDateFormat.format(oDate);
			var oMoment = moment(oDate);
			
			return oMoment.format("DD/MMM/YYYY HH:mm");
		},
		yyyyMMdd: function(oDate) {
			// var oDateFormat = DateFormat.getDateTimeInstance({
			// 	pattern: "yyyyMMdd"
			// });
			// return oDateFormat.format(oDate);
			var oMoment = moment(oDate);
			
			return oMoment.format("YYYYMMDD");
		},

		yyyy_MM_dd: function(yyyMMdd) {
			if (yyyMMdd) {
				return yyyMMdd.substring(0, 4) + "-" + yyyMMdd.substring(4, 6) + "-" + yyyMMdd.substring(6, 8);
			}
		}

	};
});