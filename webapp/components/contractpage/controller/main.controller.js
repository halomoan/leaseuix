sap.ui.define([
	'refx/leaseuix/controller/BaseController',
	'sap/ui/model/json/JSONModel',
	'sap/f/library'
], function(BaseController,JSONModel,fioriLibrary) {
	"use strict";

	return BaseController.extend("refx.leaseuix.components.contractpage.controller.main", {

		onInit: function() {
			this.initData();
		},
		
		initData: function(){
			var oViewData = {
				"FullScreen" : false,
				"FCLMode": false
			};
			
			this.getView().setModel(new JSONModel(oViewData), "viewData");
		},
		onFullScreen: function(oEvent){
			var oViewModel = this.getView().getModel("viewData");
			
			oViewModel.setProperty("/FullScreen",true);
			var oFCL = this.getView().getParent().getParent();
			oFCL.setLayout(fioriLibrary.LayoutType.MidColumnFullScreen);
		},
		onExitFullScreen: function(oEvent){
			var oViewModel = this.getView().getModel("viewData");
			
			oViewModel.setProperty("/FullScreen",false);
			var oFCL = this.getView().getParent().getParent();
			oFCL.setLayout(fioriLibrary.LayoutType.TwoColumnsMidExpanded);
		},
		onClose: function(oEvent) {
			var oViewModel = this.getView().getModel("viewData");
			var bFCLMode = oViewModel.getProperty("/FCLMode");
			
			
			if (bFCLMode) {
				var oFCL = this.getView().getParent().getParent();
				oFCL.setLayout(fioriLibrary.LayoutType.OneColumn);
			} else {
				this.onNavBack();
			}
		},
		onExit: function() {
		
		}
	});

});