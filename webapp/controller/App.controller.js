sap.ui.define([
	"refx/leaseuix/controller/BaseController"
], function(BaseController) {
	"use strict";

	return BaseController.extend("refx.leaseuix.controller.App", {
		
		// onInit: function(){
		// 	this.initData();
		// },
		// initData: function(){
		// 	this.oREFXValuesModel = new JSONModel(sap.ui.require.toUrl("refx/leaseuix/mockdata") + "/refxvalues.json");
		// },
		getValue: function(oEvent){
			
			 //var fragmentId = this.getView().createId("selectunit");
			 //var aTokens = sap.ui.core.Fragment.byId(fragmentId, "rentalUnits").getTokens();
			 //var sData = aTokens.map(function(oToken) {
			 //	  //return oToken.getText();
				//   return oToken.getKey();
				// }).join(",");
        	 console.log(sData);
		}
	});
});