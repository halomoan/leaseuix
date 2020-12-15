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
				"ContractId": null
			};
			var oModel = new JSONModel(oData);
			oModel.setDefaultBindingMode("OneWay");
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
		},
		contractFormModel: function(){
			return new JSONModel(sap.ui.require.toUrl("refx/leaseuix/mockdata") + "/contractform.json");
		}
		

	};
});