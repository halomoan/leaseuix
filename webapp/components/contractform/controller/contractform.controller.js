sap.ui.define([
	"refx/leaseuix/controller/BaseController"
], function(BaseController) {
	"use strict";

	return BaseController.extend("refx.leaseuix.components.contractform.controller.contractform", {

	
			onInit: function() {
				this.oContractForm = this.getModel("contractForm");
				this.getView().setModel(this.oContractForm,"contractform");
			},

	
			onExit: function() {
		
			}

	});

});