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
			initData: function(){
				this.oSalesRuleValuesModel = new JSONModel(sap.ui.require.toUrl("refx/leaseuix/mockdata") + "/salesbasedvalues.json");
				this.getView().setModel(this.oSalesRuleValuesModel, "salesrulevalues");
				
				this.oSalesRuleModel = new JSONModel(sap.ui.require.toUrl("refx/leaseuix/mockdata") + "/salesbased.json");
				this.byId("slrgrid1").setModel(this.oSalesRuleModel);
			},
			
			doWizard: function(){
				var oView = this.getView();
				
				this.showFormFragment(oView,"slrgrid1",this._formFragments,"refx.leaseuix.components.listsalesbased.reportingrule",false);
			}
		
	});

		
});