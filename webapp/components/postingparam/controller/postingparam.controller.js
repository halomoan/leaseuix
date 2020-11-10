sap.ui.define([
	"sap/ui/core/mvc/Controller",
	'sap/ui/model/json/JSONModel',
	"refx/leaseuix/model/formatter"
], function(Controller,JSONModel,formatter) {
	"use strict";

	return Controller.extend("refx.leaseuix.components.postingparam.controller.postingparam", {

		_formFragments: {},
		formatter: formatter,
		
		onInit: function() {
			this.initData();
		},
		
		initData: function() {
			this.oPostingParamValuesModel = new JSONModel(sap.ui.require.toUrl("refx/leaseuix/mockdata") + "/postingparamvalues.json");	
			this.getView().setModel(this.oSalesRuleValuesModel, "postingparamvalues");
			
			this.oPostingParamModel = new JSONModel(sap.ui.require.toUrl("refx/leaseuix/mockdata") + "/postingparams.json");
			this.getView().setModel(this.oPostingParamModel);
		},
		
		onExit: function() {
			// destroy the model
			this.oPostingParamValuesModel.destroy();
			this.oPostingParamModel.destroy();
		}

	});

});