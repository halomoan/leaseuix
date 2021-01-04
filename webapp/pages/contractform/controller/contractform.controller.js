sap.ui.define([
	"refx/leaseuix/controller/BaseController",
	'sap/ui/model/json/JSONModel'
], function(BaseController,JSONModel) {
	"use strict";

	return BaseController.extend("refx.leaseuix.components.contractform.controller.contractform", {

	
			onInit: function() {
				this.oContractForm = this.getModel("contractForm");
				this.getView().setModel(this.oContractForm,"formData");
				
				//this.oContractFormValuesModel = new JSONModel(sap.ui.require.toUrl("refx/leaseuix/mockdata") + "/contractformvalues.json");
				//this.getView().setModel(this.oContractFormValuesModel,"contractformvalues");
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

			fromDateChanged: function(oEvent){
				console.log(this.oContractForm);
			},
			onExit: function() {
		
			}

	});

});