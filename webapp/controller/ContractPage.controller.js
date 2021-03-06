sap.ui.define([
	"refx/leaseuix/controller/BaseController",
	'sap/ui/model/json/JSONModel'
], function(BaseController,JSONModel) {
	"use strict";

	return BaseController.extend("refx.leaseuix.controller.ContractPage", {

	
			onInit: function() {
				
				this.oGobalData = this.getModel("globalData");
				
				this.oRouter = this.getRouter();
				this.oRouter.getRoute("contractpage").attachPatternMatched(this.__onRouteMatched, this);
			},
			
			
			__onRouteMatched: function(oEvent){
				var sRouteName = oEvent.getParameter("name"),
					oArguments = oEvent.getParameter("arguments");
				this._contract = oArguments.contractId || this._contract || "0";
				
				
				this.oGobalData.setProperty("/ContractId",oArguments.contractId);
				
				this.getView().bindElement({
					path: "/ContractSet('" + this._contract + "')"
					
				});
			},
	
			onExit: function() {
				this.oRouter.detachRouteMatched(this.__onRouteMatched, this);
			}

	});

});