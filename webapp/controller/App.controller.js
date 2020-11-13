sap.ui.define([
	'sap/ui/core/mvc/Controller'
], function(Controller) {
	"use strict";

	return Controller.extend("refx.leaseuix.controller.App", {
		
		getValue: function(oEvent){
			
			 var oModel = this.getOwnerComponent().getModel("contractform"); 
        	 console.log(oModel.getData());
		}
	});
});