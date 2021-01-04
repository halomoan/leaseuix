sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/ui/Device"
], function(JSONModel, Device) {
	"use strict";

	return {

		createDeviceModel: function() {
			var oModel = new JSONModel(Device);
			oModel.setDefaultBindingMode("OneWay");
			return oModel;
		},
		
		globalDataModel: function(){
			var oData = {
				"KeyDate": null,
				"BEKey": null,
				"CompanyCode": null,
				"BusinessEntity" : null,
				"ContractId": null,
				"ContractType": "L001"
			};
			var oModel = new JSONModel(oData);
			oModel.setDefaultBindingMode("OneWay");
			return oModel;
		},
		
		contractFormModel: function(){
			var oData = {
				"CompanyCode": null,
				"BusinessEntity" : null,
				"SelectedUnits": [],
				"StartDate": new Date(),
				"EndDate": null,
				"EndTermDate" : null,
				"ContractName": "",
				"Industry": "",
				"RelSalesRule": false
				
			};
			var oModel = new JSONModel(oData);
			oModel.setDefaultBindingMode("TwoWay");
			return oModel;
		},
		postingParamModel: function(){
			return new JSONModel(sap.ui.require.toUrl("refx/leaseuix/mockdata") + "/postingparams.json");
		},
		
		rentalUnitModel: function(){
			return new JSONModel(sap.ui.require.toUrl("refx/leaseuix/mockdata") + "/rentalunits.json");
		},
		conditionModel: function(){
			return new JSONModel(sap.ui.require.toUrl("refx/leaseuix/mockdata") + "/conditions.json");
		},
		selectedCustModel: function(){
			return new JSONModel(sap.ui.require.toUrl("refx/leaseuix/mockdata") + "/selectedcustomer.json");
		},
		selectedContactModel: function(){
			return new JSONModel(sap.ui.require.toUrl("refx/leaseuix/mockdata") + "/selectedcontacts.json");
		},
		salesRuleModel: function(){
			return new JSONModel(sap.ui.require.toUrl("refx/leaseuix/mockdata") + "/salesbased.json");
		}
		

	};
});