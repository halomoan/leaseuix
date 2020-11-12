sap.ui.define([
	'sap/ui/core/mvc/Controller'
], function(Controller) {
	"use strict";

	return Controller.extend("refx.leaseuix.controller.App", {
		
		getValue: function(oEvent){
			
			 //var fragmentId = this.getView().createId("selectunit");
			 //var aTokens = sap.ui.core.Fragment.byId(fragmentId, "rentalUnits").getTokens();
			 //var sData = aTokens.map(function(oToken) {
			 //	  //return oToken.getText();
				//   return oToken.getKey();
				// }).join(",");
				
			 var oModel = this.getOwnerComponent().getModel("postingParams"); 
        	 console.log(oModel);
		}
	});
});