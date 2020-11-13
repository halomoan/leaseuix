sap.ui.define([
	"refx/leaseuix/controller/BaseController",
	'sap/ui/model/json/JSONModel'
], function(BaseController) {
	"use strict";

	return BaseController.extend("refx.leaseuix.controller.ContractPage", {

	
			onInit: function() {
				this.oSelectedUnits = this.getModel("rentalUnits");
				this.getView().setModel(this.oSelectedUnits);
			},

	
			onExit: function() {
		
			}

	});

});