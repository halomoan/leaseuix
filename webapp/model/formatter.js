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

			var endDate = moment(oEDate).add(1,'days');
			var startDate = moment(oSDate);
			
			var years = endDate.diff(startDate, 'year');
			
			
			return Math.abs(years);
		},
		diffMonth: function(oSDate, oEDate) {
		
			var endDate = moment(oEDate).add(1,'days');
			var startDate = moment(oSDate);
			
			var years = endDate.diff(startDate, 'year');
			startDate.add(years, 'years');
			
			var months = endDate.diff(startDate, 'months');
			

			return Math.abs(months);
		},

		diffDay: function(oSDate, oEDate) {
		
			var endDate = moment(oEDate).add(1,'days');
			var startDate = moment(oSDate);
			
			var years = endDate.diff(startDate, 'year');
			startDate.add(years, 'years');
			
			var months = endDate.diff(startDate, 'months');
			
			startDate.add(months, 'months');
			
			var days = endDate.diff(startDate, 'days');

			return Math.abs(days);
		},
		
		diffDateState:  function(oSDate, oEDate) {
		
			var endDate = moment(oEDate).add(1,'days');
			var startDate = moment(oSDate);
			
			var days = endDate.diff(startDate, 'days');
			
			if (days <= 60) {
				return 'Error';
			} else {
				return 'Success';
			}

			
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