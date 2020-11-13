sap.ui.define([
	"refx/leaseuix/controller/BaseController",
	'sap/ui/model/json/JSONModel'
], function(BaseController,JSONModel) {
	"use strict";

	return BaseController.extend("refx.leaseuix.components.contractform.controller.contractform", {

	
			onInit: function() {
				this.oContractForm = this.getModel("contractForm");
				this.getView().setModel(this.oContractForm,"contractform");
				
				this.oContractFormValuesModel = new JSONModel(sap.ui.require.toUrl("refx/leaseuix/mockdata") + "/contractformvalues.json");
				this.getView().setModel(this.oContractFormValuesModel,"contractformvalues");
				
				
				
			},

	
			onExit: function() {
		
			}

	});

});