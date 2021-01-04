sap.ui.define([
	"refx/leaseuix/controller/BaseController",
	'sap/ui/model/json/JSONModel'
], function(BaseController, JSONModel) {
	"use strict";

	return BaseController.extend("refx.leaseuix.controller.ContractForm", {

	
		onInit: function() {
			this.oRouter = this.getRouter();
			this.oRouter.getRoute("contractform").attachMatched(this.__onRouteMatched, this);
		},

		__onRouteMatched: function(oEvent) {
			var oArguments = oEvent.getParameter("arguments");
			
			this.BEKey = oArguments.Key;
			this.CompanyCode = oArguments.CompanyCode;
			this.BusinessEntity = oArguments.BusinessEntity;
			
			var oGlobalModel = this.getModel("globalData");
			
			oGlobalModel.setProperty("/BEKey",this.BEKey);
			oGlobalModel.setProperty("/CompanyCode",this.CompanyCode);
			oGlobalModel.setProperty("/BusinessEntity",this.BusinessEntity);
			
			var oFormModel = this.getModel("contractForm");
			oFormModel.setProperty("/CompanyCode",this.CompanyCode);
			oFormModel.setProperty("/BusinessEntity",this.BusinessEntity);
		},
		onExit: function() {
		
		}

	});

});