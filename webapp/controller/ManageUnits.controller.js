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
			this.oRentalUnitsModel =  new JSONModel(sap.ui.require.toUrl("refx/leaseuix/mockdata") + "/rentalunitvalues.json");
			this.getView().setModel(this.oRentalUnitsModel);
		},

		onExit: function() {

		}

	});

});