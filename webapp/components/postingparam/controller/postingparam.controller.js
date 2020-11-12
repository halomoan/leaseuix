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
			
			//this.oPostingParamModel = new JSONModel(sap.ui.require.toUrl("refx/leaseuix/mockdata") + "/postingparams.json");
			this.oPostingParamModel = this.getModel("postingParams");
			this.getView().setModel(this.oPostingParamModel);
			
			this._PostingSort = 1;
		},
		
		onPostingAdd: function(){
			var oNewItem = {...this.getView().getModel("postingparamvalues").getProperty("/postingtmplt")};
			var oModel = this.getView().getModel();
			var oData = oModel.getProperty("/postingparam");
			
			this._setDefaultValue(oNewItem);	
			
			oData.unshift(oNewItem);
			oModel.refresh();
		
		},
		onPostingDelete: function(oEvent){
			var oList = oEvent.getSource();
			var oItem = oEvent.getParameter("listItem");
			var oCtx = oItem.getBindingContext();
			var sPath = oCtx.getPath();
		
			
			
			if (oCtx.getProperty(sPath + "/new")) {
				var idx = sPath.split("/")[1];
				var delidx = parseInt(sPath.substring(sPath.lastIndexOf('/') + 1), 10);
				var oData = oList.getModel().getData();
				
				oData.postingparam.splice(delidx, 1);
				oList.getModel().refresh();
				
			} else {
				MessageBox.information("This Item Cannot Be Deleted");
			}
		},
		_setDefaultValue: function(oItem){
			oItem.fromDate = this.formatter.yyyyMMdd(new Date());                                                
		},
		
		onPostingSort: function(){
			var oModel = this.getView().getModel();
			var aData = oModel.getProperty("/postingparam");
			
			this._PostingSort = -1 * this._PostingSort;
			
			aData.sort((a, b) =>
				(a.fromDate > b.fromDate) ? 1 * this._PostingSort : -1 * this._PostingSort
			);
			oModel.refresh();
		},
		onExit: function() {
			// destroy the model
			this.oPostingParamValuesModel.destroy();
			this.oPostingParamModel.destroy();
		}

	});

});