sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
	"refx/leaseuix/model/models"
], function(UIComponent, Device, models) {
	"use strict";

	return UIComponent.extend("refx.leaseuix.Component", {

		metadata: {
			manifest: "json"
		},

		/**
		 * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
		 * @public
		 * @override
		 */
		init: function() {
			// call the base component's init function
			UIComponent.prototype.init.apply(this, arguments);

			// set the device model
			this.setModel(models.createDeviceModel(), "device");
			
			
			var oRouter = this.getRouter();
			oRouter.initialize();
			
			
		},
		
		createModel: function(sModelName){
			
			switch(sModelName) {
				case "globalData" : this.setModel(models.globalDataModel(),"globalData"); break;
				case "contractForm" : this.setModel(models.contractFormModel(),"contractForm"); break;
				case "postingParams" : this.setModel(models.postingParamModel(),"postingParams"); break;	
				case "rentalUnits" : this.setModel(models.rentalUnitModel(),"rentalUnits"); break;	
				case "conditions" : this.setModel(models.conditionModel(),"conditions"); break;	
				case "selectedCust" : this.setModel(models.selectedCustModel(),"selectedCust"); break;	
				case "selectedContacts" : this.setModel(models.selectedContactModel(),"selectedContacts"); break;
				case "salesRules" : this.setModel(models.salesRuleModel(),"salesRules"); break;
			}
			
			
		},
		

		exit : function() {
			
		}

		
	});
});