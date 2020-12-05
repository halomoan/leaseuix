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
		_formFragments: {},
		
		onInit: function(){
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.getRoute("contractlist").attachMatched(this.__onRouteMatched, this);
		},
		
		__onRouteMatched: function(oEvent) {
			this.initData();
		},
		
		initData: function() {
			var oViewData = {
				"KeyDate": new Date(),
				"ContractType": "L002",
				"ContractTypeText": "Tenancy Retail Contract",
				"NoOfContracts" : 0
			};
			
			this.CompanyCode = "1001";
			this.BusinessEntity = "1001";
			this.ContractType = "L001";
			
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
		onSort: function(){
			this.showFormDialogFragment(this.getView(), this._formFragments, "refx.leaseuix.fragments.contractsviewsetting", this);
		},
		
		onSortConfirm: function(oEvent){
			var oSortItem = oEvent.getParameters().sortItem;
			var bDescending = false;
		
			this.aSort = [];
			
			var oGroupItem = oEvent.getParameters().groupItem;
			if(oGroupItem) {
				bDescending = oEvent.getParameters().groupDescending;
				var sGroupBy = oGroupItem.getKey();
				
				var oGroupBy = 	new sap.ui.model.Sorter(sGroupBy, bDescending, true);
				this.aSort.push(oGroupBy);
			} 
			
			
			if (oSortItem){
				bDescending = oEvent.getParameters().sortDescending;
				var sSortBy = oSortItem.getKey();
				var oSort = new sap.ui.model.Sorter(sSortBy, bDescending,false);
				this.aSort.push(oSort);
			}
			
			
		
			this._updateBinding();
		},
		_updateBinding : function(){
			var oDate = this.getView().getModel("viewData").getProperty("/KeyDate");
			var sDate = formatter.yyyyMMdd(oDate);
			var aFilters = this._mergeFilters();
			
			var oTable = this.byId("contractTable");
			if (oTable) {
				var oBindingInfo = oTable.getBindingInfo("items");
				if (!oBindingInfo.parameters) {
					oBindingInfo.parameters = { };
					oBindingInfo.parameters.custom = {};
					
				}
				

				oBindingInfo.parameters.custom.at = sDate;
				oBindingInfo.filters = aFilters;
				oBindingInfo.sorter = this.aSort;
				oTable.bindItems(oBindingInfo);
			}
			
			var oModel = this.getModel();
			var oViewModel = this.getView().getModel("viewData");
			
			oModel.read("/ContractSet/$count", {
					filters: aFilters,
					urlParameters : {"at" : sDate },
                    success: function (oEvt, oResponse) {
                    if(isNaN(oResponse.data)){
                    	oViewModel.setProperty("/NoOfContracts",0);
                    } else {
                    	oViewModel.setProperty("/NoOfContracts",oResponse.data);
                    }
                }
                });
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
			return aFilters;
		},
		onExit: function() {
			this.removeFragment(this._formFragments);
		}
		

	});

});