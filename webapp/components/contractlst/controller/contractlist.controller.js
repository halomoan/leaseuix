sap.ui.define([
	'refx/leaseuix/controller/BaseController',
	'sap/ui/model/json/JSONModel',
	'sap/ui/model/Filter',
	'sap/ui/model/FilterOperator',
	"sap/m/GroupHeaderListItem",
	"refx/leaseuix/model/formatter"
], function(BaseController,JSONModel,Filter,FilterOperator,GroupHeaderListItem,formatter) {
	"use strict";

	return BaseController.extend("refx.leaseuix.components.contractlst.controller.contractlist", {
		formatter: formatter,
		
		onInit: function(){
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.getRoute("contractlist").attachMatched(this.__onRouteMatched, this);
		},
		
		__onRouteMatched: function(oEvent) {
			this.initData();
		},
		
		initData: function() {
			var oViewData = {
				"KeyDate": new Date()
			};
			
			this.CompanyCode = "1002";
			this.BusinessEntity = "1002";
			this.ContractType = "L002";
			this.oFilterCoCode = new Filter("CompanyCode", FilterOperator.EQ, this.CompanyCode); // Filter Company Code
			this.oFilterBE = new Filter("BusinessEntity", FilterOperator.EQ, this.BusinessEntity); // Filter BE
			this.oFilterType = new Filter("ContractType", FilterOperator.EQ, this.ContractType); // Filter BE
			this.aFilters = [this.oFilterCoCode, this.oFilterBE,this.oFilterType];
			this.oFilterSearch = null;
			
			this.aSort = [new sap.ui.model.Sorter('IndustryText', false, true)];
			
			this.getView().setModel(new JSONModel(oViewData), "viewData");
			
			this.getOwnerComponent().getModel().metadataLoaded().then(function() {
				var oModel = this.getOwnerComponent().getModel();

				this.getView().setModel(oModel);
			}.bind(this));
			
			this._updateBinding();
		},
		
		getGroupHeader: function(oGroup){
			return new GroupHeaderListItem({
				title : "Industry: " + oGroup.key
			});
		},
		onKeyDateChange: function(oEvent){
			// var oViewModel = this.getView().getModel("viewData");
			// var oDate = new Date(oEvent.getParameter("value"));
			// oViewModel.setProperty("/KeyDate", oDate);
			
			this._updateBinding();
		},
		onSearch : function(oEvent){
			this.oFilterSearch = [];
			var sQuery = oEvent.getParameter("query");
			if (sQuery && sQuery.length > 0) {
				this.oFilterSearch = new Filter({
					filters: [new Filter("ContractNo", FilterOperator.Contains, sQuery), new Filter("ContractName", FilterOperator.Contains, sQuery)],
					and: false
				});
			}
			this._updateBinding();
		},
		_updateBinding : function(){
			var oThis = this;
			var oDate = this.getView().getModel("viewData").getProperty("/KeyDate");
			
			var oTable = this.byId("contractTable");
			
			if (oTable) {
				var oBindingInfo = oTable.getBindingInfo("items");
				if (!oBindingInfo.parameters) {
					oBindingInfo.parameters = { };
					oBindingInfo.parameters.custom = {};
					
				}
				var aFilters = this._mergeFilters();

				oBindingInfo.parameters.custom.at = formatter.yyyyMMdd(oDate);
				oBindingInfo.filters = aFilters;
				oBindingInfo.sorter = this.aSort;
				oTable.bindItems(oBindingInfo);
			}
		},
		_mergeFilters : function(){
			var aFilters = [];
			var i = 0;

			if (this.aFilters.length > 0) {
				for (i = 0; i < this.aFilters.length; i++) {
					aFilters.push(this.aFilters[i]);
				}
			}
			
			if (this.oFilterSearch) {
				//aFilters = aFilters.concat(this.oFilterSearch);
				aFilters.push(this.oFilterSearch);
			}
			console.log(aFilters);
			return aFilters;
		}
		

	});

});