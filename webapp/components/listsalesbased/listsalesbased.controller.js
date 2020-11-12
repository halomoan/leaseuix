sap.ui.define([
	"refx/leaseuix/controller/BaseController",
	'sap/ui/model/json/JSONModel',
	"sap/ui/core/Fragment",
	"sap/m/MessageBox",
	"sap/m/MessageToast",
	"sap/ui/core/dnd/DragInfo",
	"sap/ui/core/dnd/DropInfo",
	"sap/ui/core/dnd/DropPosition",
	"sap/ui/core/dnd/DropLayout",
	"sap/f/dnd/GridDropInfo",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"refx/leaseuix/model/formatter"
], function(BaseController, JSONModel, Fragment, MessageBox, MessageToast, DragInfo, DropInfo, DropPosition, DropLayout, GridDropInfo,
	Filter, FilterOperator, formatter) {
	"use strict";

	return BaseController.extend("refx.leaseuix.components.listsalesbased.listsalesbased", {
		formatter: formatter,
		_formFragments: {},
		onInit: function() {
			this.initData();
		},
		initData: function() {
			// var viewData = {
			// 	"shownograde": true,
			// }
			this.oSalesRuleValuesModel = new JSONModel(sap.ui.require.toUrl("refx/leaseuix/mockdata") + "/salesbasedvalues.json");
			this.getView().setModel(this.oSalesRuleValuesModel, "salesrulevalues");

		
			
			//this.oSalesRuleModel = new JSONModel(sap.ui.require.toUrl("refx/leaseuix/mockdata") + "/salesbased.json");
			this.oSalesRuleModel = this.getModel("salesRules");
			this.byId("slrcontainer").setModel(this.oSalesRuleModel);
			
			this._RepRuleSort = 1;
			this._SalesRuleSort = 1;
		},

		doWizard: function() {
			var oView = this.getView();

			this.showFormFragment(oView, "slrcontainer", this._formFragments, "refx.leaseuix.components.listsalesbased.reportingrule", false);
		},

		onRepRuleDelete: function(oEvent) {
			var oList = oEvent.getSource();
			var oItem = oEvent.getParameter("listItem");
			var oCtx = oItem.getBindingContext();
			var sPath = oCtx.getPath();

			

			if (oCtx.getProperty("new")) {
				var idx = sPath.split("/")[1];
				var delidx = parseInt(sPath.substring(sPath.lastIndexOf('/') + 1), 10);

				var oData = oList.getModel().getData();
				oData[idx].items.splice(delidx, 1);
				oList.getModel().refresh();
			} else {
				MessageBox.information("This Item Cannot Be Deleted");
			}

		},

		onRepRuleAdd: function() {

			var oModel = this.byId("slrcontainer").getModel();
			var oData = oModel.getProperty("/reportingrule");
			var oItemTemplate = {...this.getView().getModel("salesrulevalues").getProperty("/repruleitem")
			};

			var iMaxId = 0;
			for (var i = 0; i < oData.items.length; i++ ){
				if (oData.items[i].id > iMaxId ) {
					iMaxId = oData.items[i].id;
				}	
			}
			oItemTemplate.id = iMaxId + 10;
			oData.items.unshift(oItemTemplate);
			oModel.refresh();

		},

		onRepRuleSort: function() {
			var oModel = this.byId("slrcontainer").getModel();
			var aData = oModel.getProperty("/reportingrule").items;

			this._RepRuleSort = -1 * this._RepRuleSort;
			aData.sort((a, b) =>

				//(a.fromDate > b.fromDate) ? 1 * this._RepRuleSort : -1 * this._RepRuleSort
				(a.id > b.id) ? 1 * this._RepRuleSort : -1 * this._RepRuleSort
			);
			oModel.refresh();
		},
		
		onSalesRuleAdd: function(){
			
			var oModel = this.byId("slrcontainer").getModel();
			var oData = oModel.getProperty("/salesrule");
			var oItemTemplate = {...this.getView().getModel("salesrulevalues").getProperty("/salesruleitem")
			};
			
			var iMaxId = 0;
			for (var i = 0; i < oData.items.length; i++ ){
				if (oData.items[i].id > iMaxId ) {
					iMaxId = oData.items[i].id;
				}	
			}
			oItemTemplate.id = iMaxId + 10;
			oData.items.unshift(oItemTemplate);
			oModel.refresh();
		},
		
		onSalesRuleDelete: function(oEvent){
			var oList = oEvent.getSource();
			var oItem = oEvent.getParameter("listItem");
			var oCtx = oItem.getBindingContext();
			var sPath = oCtx.getPath();

			if (oCtx.getProperty("new")) {
				var idx = sPath.split("/")[1];
				var delidx = parseInt(sPath.substring(sPath.lastIndexOf('/') + 1), 10);

				var oData = oList.getModel().getData();
				oData[idx].items.splice(delidx, 1);
				oList.getModel().refresh();
			} else {
				MessageBox.information("This Item Cannot Be Deleted");
			}
		},
		
		onSalesRuleSort: function(oEvent){
			var oModel = this.byId("slrcontainer").getModel();
			var aData = oModel.getProperty("/salesrule").items;

			this._SalesRuleSort = -1 * this._SalesRuleSort;
			aData.sort((a, b) =>

				//(a.fromDate > b.fromDate) ? 1 * this._SalesRuleSort : -1 * this._SalesRuleSort
				(a.id > b.id) ? 1 * this._SalesRuleSort : -1 * this._SalesRuleSort
			);
			oModel.refresh();
		},
		
		onGradeTypeChange: function(oEvent){
			var oComboBox = oEvent.getSource(),
				sSelectedKey = oComboBox.getSelectedKey(),
				sValue = oComboBox.getValue();
		}

	});

});