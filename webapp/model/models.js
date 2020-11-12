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
		
		postingParamModel: function(){
			return new JSONModel(sap.ui.require.toUrl("refx/leaseuix/mockdata") + "/postingparams.json");
		}
		

	};
});