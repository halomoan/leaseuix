sap.ui.define([
	"sap/ui/core/mvc/Controller",
	'sap/ui/model/json/JSONModel',
	"sap/m/MessageToast",
	"refx/leaseuix/model/formatter"
], function (Controller,JSONModel,MessageToast,formatter) {
	"use strict";
	
	return Controller.extend("refx.leaseuix.components.gridcondition.standardwizard", {
		onInit: function(){
			console.log('YES');
		},
		
		closeStdWizard: function() {
			console.log('ABC');
	    	//this.byId("stdWizardDialog").close();
	    }
		
	});
	
});