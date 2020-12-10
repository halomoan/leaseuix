sap.ui.define([
	"refx/leaseuix/controller/BaseController",
	'sap/ui/model/json/JSONModel'
], function(BaseController, JSONModel) {
	"use strict";

	return BaseController.extend("refx.leaseuix.controller.ContractList", {

		onInit: function() {

			var oViewData = {
				"layout": sap.f.LayoutType.OneColumn
			};

			this.getView().setModel(new JSONModel(oViewData), "viewData");

		},

		onExit: function() {

		}

	});

});