sap.ui.define([
	"refx/leaseuix/controller/BaseController",
	'sap/ui/model/json/JSONModel',
	"refx/leaseuix/model/formatter"
], function(BaseController,JSONModel,formatter) {
	"use strict";

	return BaseController.extend("refx.leaseuix.controller.ManageUnits", {
		formatter: formatter,
		onInit: function() {
			this.initData();
		},

		initData: function() {
			this.oViewData = {
				"Filter" : {
					"AvailDate" : null,
					"AvailWeek" : {
						 value: 5, min:0, max:54
					},
					"AvailYear" : {
						 value: 0, min:0, max:24
					}
				}
			}
			this.oRentalUnitsModel =  new JSONModel(sap.ui.require.toUrl("refx/leaseuix/mockdata") + "/rentalunitvalues.json");
			this.getView().setModel(this.oRentalUnitsModel);
			this.getView().setModel(new JSONModel(this.oViewData),"viewData");
		},
		onAvailWeekChange: function(oEvent){
			var oDate = new Date();
			var numWeeks = oEvent.getParameter("value");
			oDate.setDate(oDate.getDate() + numWeeks * 7);
			this.oViewData.Filter.AvailDate = formatter.yyyyMMdd(oDate);
			
		},
		onAvailYearChange: function(oEvent){
			console.log(oEvent.getParameter("value"));
		},
		onExit: function() {

		}

	});

});