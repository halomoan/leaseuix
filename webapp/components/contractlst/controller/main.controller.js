sap.ui.define([
	'refx/leaseuix/controller/BaseController',
	'sap/ui/model/json/JSONModel',
	'sap/ui/model/Filter',
	'sap/ui/model/FilterOperator',
	"sap/m/GroupHeaderListItem",
	'sap/f/library',
	"refx/leaseuix/model/formatter"
], function(BaseController, JSONModel, Filter, FilterOperator, GroupHeaderListItem, fioriLibrary, formatter) {
	"use strict";

	return BaseController.extend("refx.leaseuix.components.contractlst.controller.main", {
		formatter: formatter,
		_formFragments: {},

		onInit: function() {
			this.oRouter = this.getRouter();
			this.oRouter.getRoute("contractlist").attachMatched(this.__onRouteMatched, this);
		},

		__onRouteMatched: function(oEvent) {
			
			var oArguments = oEvent.getParameter("arguments");
			
			this.CompanyCode = oArguments.CompanyCode;
			this.BusinessEntity = oArguments.BusinessEntity;
			
			this.initData();
		},

		initData: function() {
			var oViewData = {
				"KeyDate": new Date(),
				"FCLMode": true,
				"FullScreen" : false, 
				"ContractType": "L002",
				"ContractTypeText": "Tenancy Retail Contract",
				"NoOfContracts": 0,
				"Filter": {
					"AvailNo": {
						value: 0,
						min: 0,
						max: 54
					},
					"AvailUnit": "1"
				}
			};

			this.ContractType = "L002";

			this.oFilterCoCode = new Filter("CompanyCode", FilterOperator.EQ, this.CompanyCode); // Filter Company Code
			this.oFilterBE = new Filter("BusinessEntity", FilterOperator.EQ, this.BusinessEntity); // Filter BE
			this.oFilterType = new Filter("ContractType", FilterOperator.EQ, this.ContractType); // Filter BE
			this.aFilters = [this.oFilterCoCode, this.oFilterBE, this.oFilterType];
			this.oFilterSearch = null;

			this.oFilterDaysToExpire = null;

			this.aSort = [new sap.ui.model.Sorter('IndustryText', false, true), new sap.ui.model.Sorter('ContractName', false, false)];

			this.getView().setModel(new JSONModel(oViewData), "viewData");
			
			//this.oGlobalData = this.getModel("globalData");
			

			this.getOwnerComponent().getModel().metadataLoaded().then(function() {
				var oModel = this.getOwnerComponent().getModel();

				this.getView().setModel(oModel);
			}.bind(this));

			this._updateBinding();
		},

		getGroupHeader: function(oGroup) {
			return new GroupHeaderListItem({
				title: "Industry: " + oGroup.key
			});
		},
		onKeyDateChange: function(oEvent) {
			// var oViewModel = this.getView().getModel("viewData");
			//var oDate = new Date(oEvent.getParameter("value"));
			// oViewModel.setProperty("/KeyDate", oDate);
			//this.oGlobalData.setProperty("/KeyDate",oDate);
			this._updateBinding();
		},
		onSearch: function(oEvent) {
			this.oFilterSearch = [];
			var sQuery = oEvent.getParameter("query");

			if (sQuery && sQuery !== '') {
				this.oFilterSearch = new Filter({
					filters: [new Filter("ContractNo", FilterOperator.Contains, sQuery), new Filter("ContractName", FilterOperator.Contains, sQuery)],
					and: false
				});
			} else {
				this.oFilterSearch = null;
			}
			this._updateBinding();
		},
		onSort: function() {
			this.showFormDialogFragment(this.getView(), this._formFragments, "refx.leaseuix.fragments.contractsviewsetting", this);
		},
		onSortReset: function(oEvent) {
			var oModel = this.getView().getModel("viewData");

			this.aSort = [new sap.ui.model.Sorter('IndustryText', false, true), new sap.ui.model.Sorter('ContractName', false, false)];
			this.oFilterDaysToExpire = null;

			oModel.setProperty("/Filter/AvailNo/value", 0);
			oModel.setProperty("/Filter/AvailUnit", "1");
		},
		onSortConfirm: function(oEvent) {
			var oSortItem = oEvent.getParameters().sortItem;
			var bDescending = false;

			this.aSort = [];

			var oGroupItem = oEvent.getParameters().groupItem;
			if (oGroupItem) {
				bDescending = oEvent.getParameters().groupDescending;
				var sGroupBy = oGroupItem.getKey();

				var oGroupBy = new sap.ui.model.Sorter(sGroupBy, bDescending, true);
				this.aSort.push(oGroupBy);
			}

			if (oSortItem) {
				bDescending = oEvent.getParameters().sortDescending;
				var sSortBy = oSortItem.getKey();
				var oSort = new sap.ui.model.Sorter(sSortBy, bDescending, false);
				this.aSort.push(oSort);
			}

			this._updateBinding();
		},
		onStepChange: function(oEvent) {
			var oModel = this.getView().getModel("viewData");

			var num = oModel.getProperty("/Filter/AvailNo/value");
			var unit = oModel.getProperty("/Filter/AvailUnit");

			var iDays = 0;

			switch (unit) {
				case "0":
					iDays = num * 7;
					break;
				case "1":
					iDays = num * 31;
					break;
				case "2":
					iDays = num * 366;
					break;
			}

			if (iDays > 0) {
				this.oFilterDaysToExpire = new Filter({
					path: "DaysToExpire",
					operator: FilterOperator.BT,
					value1: 0,
					value2: iDays
				});
			}
		},
		onListItemPress: function(oEvent) {

			var oFCL = this.getView().getParent().getParent();

			oFCL.setLayout(fioriLibrary.LayoutType.TwoColumnsMidExpanded);
			var sPath = oEvent.getSource().getBindingContext().getPath();
			
			var oControl = sap.ui.getCore().byId("__xmlview1--detailView--ContractDetail");

			oControl.bindElement(sPath);

		},
		_updateBinding: function() {
			var oDate = this.getView().getModel("viewData").getProperty("/KeyDate");
			var sDate = formatter.yyyyMMdd(oDate);
			var aFilters = this._mergeFilters();

			var oTable = this.byId("contractTable");
			if (oTable) {
				var oBindingInfo = oTable.getBindingInfo("items");
				if (!oBindingInfo.parameters) {
					oBindingInfo.parameters = {};
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
				urlParameters: {
					"at": sDate
				},
				success: function(oEvt, oResponse) {
					if (isNaN(oResponse.data)) {
						oViewModel.setProperty("/NoOfContracts", 0);
					} else {
						oViewModel.setProperty("/NoOfContracts", oResponse.data);
					}
				}
			});
		},
		_mergeFilters: function() {
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

			if (this.oFilterDaysToExpire) {
				aFilters.push(this.oFilterDaysToExpire);
			}
			return aFilters;
		},
		onExit: function() {
			this.removeFragment(this._formFragments);
		}

	});

});