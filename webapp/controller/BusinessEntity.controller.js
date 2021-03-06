sap.ui.define([
	"refx/leaseuix/controller/BaseController",
], function(BaseController) {
	"use strict";

	return BaseController.extend("refx.leaseuix.controller.BusinessEntity", {

		onInit: function() {
			this.oRouter = this.getRouter();
			this.oRouter.getRoute("businessentity").attachPatternMatched(this.__onRouteMatched, this);
		},
		
		__onRouteMatched: function(oEvent){
			
			
		},
		onSelectBE: function(sKey,sCoCode,sBE){
			
			//this.oRouter.navTo("manageunits",{'Key': sKey, 'CompanyCode': sCoCode,'BusinessEntity': sBE });	
			this.oRouter.navTo("contractform",{'Key': sKey, 'CompanyCode': sCoCode,'BusinessEntity': sBE });	
		},
		onExit: function() {
			this.oRouter.detachRouteMatched(this.__onRouteMatched, this);
		}

	});

});