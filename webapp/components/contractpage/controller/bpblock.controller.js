sap.ui.define([
	'refx/leaseuix/controller/BaseController',
	'sap/ui/model/json/JSONModel',
	"refx/leaseuix/model/formatter"
], function(BaseController, JSONModel, formatter) {
	"use strict";

	return BaseController.extend("refx.leaseuix.components.contractpage.controller.bpblock", {

		onInit: function() {
			this.initData();
		},

		initData: function() {
			var oViewData = {
				"EditMode": false
			};
			this.getView().setModel(new JSONModel(oViewData), "viewData");

			// var oBPR101 = this.getView().byId("mainbp");
			// oBPR101.bindElement({
			// 	path: 'BusinessPartnerSet',
			// 	filters: [new sap.ui.model.Filter("BPRole", sap.ui.model.FilterOperator.EQ, 'BPR101')]
			// });
			// console.log(oBPR101);
		},

		onExit: function() {

		}

	});

});