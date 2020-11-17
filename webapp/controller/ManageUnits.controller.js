sap.ui.define([
	"refx/leaseuix/controller/BaseController",
	'sap/ui/model/json/JSONModel',
	"refx/leaseuix/model/formatter"
], function(BaseController, JSONModel, formatter) {
	"use strict";

	return BaseController.extend("refx.leaseuix.controller.ManageUnits", {
		formatter: formatter,
		_formFragments: {},
		onInit: function() {
			this.initData();
		},

		initData: function() {
			var oViewData = {
			
			};
			this.oRentalUnitsModel = new JSONModel(sap.ui.require.toUrl("refx/leaseuix/mockdata") + "/rentalunitvalues.json");
			this.getView().setModel(this.oRentalUnitsModel);
			this.getView().setModel(new JSONModel(oViewData), "viewData");
			
			this.oGlobalData = this.getModel("globalData"); 
			this.getView().setModel(this.oGlobalData,"globalData");
		},
	
		onUnitDetail : function(oEvent){
		
			var oSource = oEvent.getSource();
			
			var oCtx = oEvent.getSource().getBindingContext();
			
			this.showPopOverFragment(this.getView(), oSource, this._formFragments, "refx.leaseuix.fragments.popunitdetail");
			
			var oPopOver = sap.ui.core.Fragment.byId(this.getView().getId(), "unitmaster");
			oPopOver.bindElement(oCtx.getPath());
			
			
		},
		onExit: function() {

		}

	});

});