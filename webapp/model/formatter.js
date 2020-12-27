sap.ui.define(["sap/ui/core/format/NumberFormat", 
	//"sap/ui/core/format/DateFormat",
	"sap/ui/core/ValueState",
	"refx/leaseuix/libs/moment"], function(NumberFormat,ValueState,momentjs) {
	"use strict";
	/* global moment:true */
	return {
		TGFRStatus: function(bStatus) {

			if (bStatus) {
				return ValueState.Success;
			} else {
				return ValueState.Error;
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
		Frequency: function(sFreq, sFreqUnit){
		
			if (sFreqUnit === 'Months' && sFreq === '001'){
				return "Monthly";
			} else if (sFreqUnit === 'Months' && sFreq === '003'){
				return "Quarterly";
			} else if (sFreqUnit === 'Months' && sFreq === '006'){
				return "Half-Yearly";
			} else if (sFreqUnit === 'Years' && sFreq === '001'){
				return "Yearly";
			} else {
				return parseInt(sFreq,0) + " " + sFreqUnit;
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

		diffYearPart: function(oSDate, oEDate) {

			var endDate = moment(oEDate).add(1,'days');
			var startDate = moment(oSDate);
			
			var years = endDate.diff(startDate, 'year');
			
			
			return Math.abs(years);
		},
		diffMonthPart: function(oSDate, oEDate) {
		
			var endDate = moment(oEDate).add(1,'days');
			var startDate = moment(oSDate);
			
			var years = endDate.diff(startDate, 'year');
			startDate.add(years, 'years');
			
			var months = endDate.diff(startDate, 'months');
			

			return Math.abs(months);
		},

		diffDayPart: function(oSDate, oEDate) {
		
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
				return ValueState.Error;
			} else {
				return ValueState.Success;
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
		},
		ODataDate: function(oDate){
			var oMoment = moment(oDate);
			//return oMoment.format("YYYY-MM-DDTHH:MM:SSZ");
			return oMoment.format("YYYY-MM-DDT00:00:00");
		},
		AddDay: function(oDate,iDay){
			var oMoment = moment(oDate).add(iDay,'days');
			return oMoment;
		}

	};
});