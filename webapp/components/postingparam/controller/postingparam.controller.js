sap.ui.define([
	"refx/leaseuix/controller/BaseController",
	'sap/ui/model/json/JSONModel',
	"sap/m/MessageBox",
	"refx/leaseuix/model/formatter"
], function(BaseController,JSONModel,MessageBox,formatter) {
	"use strict";

	return BaseController.extend("refx.leaseuix.components.postingparam.controller.postingparam", {

		_formFragments: {},
		formatter: formatter,
		
		onInit: function() {
			this.initData();
		},
		
		initData: function() {
			this.oPostingParamValuesModel = new JSONModel(sap.ui.require.toUrl("refx/leaseuix/mockdata") + "/postingparamvalues.json");	
			this.getView().setModel(this.oPostingParamValuesModel, "postingparamvalues");
			
			this.oPostingParamModel = new JSONModel(sap.ui.require.toUrl("refx/leaseuix/mockdata") + "/postingparams.json");
			this.getView().setModel(this.oPostingParamModel);
		},
		
		onPostingAdd: function(){
			var oNewItem = {...this.getView().getModel("postingparamvalues").getProperty("/postingtmplt")};
			var oModel = this.getView().getModel();
			var oData = oModel.getProperty("/postingparam");
				
			oData.push(oNewItem);
			oModel.refresh();
		
		},
		onDelete: function(oEvent){
			var oList = oEvent.getSource();
			var oItem = oEvent.getParameter("listItem");
			var oCtx = oItem.getBindingContext();
			var sPath = oCtx.getPath();

			console.log(oCtx.getProperty("/"));
			if (oCtx.getProperty("/techstatus/new")) {
				var idx = sPath.split("/")[1];
				var delidx = parseInt(sPath.substring(sPath.lastIndexOf('/') + 1), 10);

				var oData = oList.getModel().getData();
				oData[idx].items.splice(delidx, 1);
				oList.getModel().refresh();
			} else {
				MessageBox.information("This Item Cannot Be Deleted");
			}
		},
		
		onExit: function() {
			// destroy the model
			this.oPostingParamValuesModel.destroy();
			this.oPostingParamModel.destroy();
		}

	});

});