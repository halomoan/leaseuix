sap.ui.define([
	"refx/leaseuix/controller/BaseController",
	'sap/ui/model/json/JSONModel'
], function(BaseController,JSONModel) {
	"use strict";

	return BaseController.extend("refx.leaseuix.components.contractform.controller.contractform", {

	
			onInit: function() {
				this.oContractForm = this.getModel("contractForm");
				this.getView().setModel(this.oContractForm,"formData");
				
				var oGlobalModel = this.getModel("globalData");
				
				this.getView().byId("Bukrs").bindElement(
					{
						path: "/CompanySet('" +  oGlobalModel.getProperty("/CompanyCode") + "')"
					});
				this.getView().byId("RecnType").bindElement(
					{
						path: "/ContractTypeSet(Id='" +  oGlobalModel.getProperty("/ContractType") + "',Lang='en')"
					});	
				
				
			},

			onExit: function() {
		
			}

	});

});