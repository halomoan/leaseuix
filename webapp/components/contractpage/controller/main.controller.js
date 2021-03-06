sap.ui.define([
	'refx/leaseuix/controller/BaseController',
	'sap/ui/model/json/JSONModel',
	"refx/leaseuix/model/formatter",
	'sap/f/library'
	
], function(BaseController,JSONModel,formatter,fioriLibrary) {
	"use strict";

	
	return BaseController.extend("refx.leaseuix.components.contractpage.controller.main", {
		
		formatter : formatter,
		onInit: function() {
			this.initData();
			this.oRouter = this.getRouter();
			this.oRouter.getRoute("contractlist").attachPatternMatched(this.__onRouteMatched, this);
		},
		
		__onRouteMatched: function(oEvent){
			var oViewModel = this.getView().getModel("viewData");
			oViewModel.setProperty("/FCLMode", true);
		},
		
		initData: function(){
			var oViewData = {
				"FullScreen" : false,
				"FCLMode": false
			};
			
			this.getView().setModel(new JSONModel(oViewData), "viewData");
			
			// var oObjectPageLayout = this.getView().byId("ContractDetail");
			// var oBindContext = oObjectPageLayout.getElementBinding();
			// console.log(oBindContext);
			// // var oBinding = oObjectPageLayout.getBinding("/");

			// oBinding.attachChange(function() {
			//   console.log('AC');
			// });
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
			this.oRouter.detachRouteMatched(this.__onRouteMatched, this);
		}
	});

});