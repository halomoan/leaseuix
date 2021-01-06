sap.ui.define([
	'sap/ui/comp/library',
	"refx/leaseuix/controller/BaseController",
	'sap/ui/model/json/JSONModel',
	'sap/ui/model/type/String',
	'sap/m/ColumnListItem',
	'sap/m/Label',
	'sap/m/SearchField',
	'sap/m/Token',
	'sap/ui/model/Filter',
	'sap/ui/model/FilterOperator'
], function (compLibrary, BaseController, JSONModel, typeString, ColumnListItem, Label, SearchField, Token, Filter, FilterOperator) {
	"use strict";

	return BaseController.extend("refx.leaseuix.components.formselcustomer.formselcustomer", {
		onInit: function () {
		
			this.oColModel = new JSONModel(sap.ui.require.toUrl("refx/leaseuix/components/formselcustomer") + "/columns.json");
			// this.oCustomersModel = new JSONModel(sap.ui.require.toUrl("refx/leaseuix/mockdata") + "/customers.json");
			// this.oSelectedCustomerModel = this.getModel("selectedCust");
			// this.getView().setModel(this.oCustomersModel);
			
			var oGlobalModel = this.getModel("globalData");
			
			this.CompanyCode = oGlobalModel.getProperty("/CompanyCode");
			this.oFilterCoCode = new Filter("CompanyCode", FilterOperator.EQ, this.CompanyCode); // Filter Company Code
			
			this.oFilterBPRole = new Filter("BPRole", FilterOperator.EQ, "BPR101"); // Filter BP Role
			this.aFilters = [this.oFilterCoCode,this.oFilterBPRole];
			
			this.oContractForm = this.getModel("contractForm");
			this.getView().setModel(this.oContractForm,"formData");
		},

		// #region
		onValueHelpRequested: function() {
			var aCols = this.oColModel.getData().cols;
			this._oBasicSearchField = new SearchField({
				showSearchButton: false
			});

			this._oValueHelpDialog = sap.ui.xmlfragment("refx.leaseuix.components.formselcustomer.formselcustomer", this);
			this.getView().addDependent(this._oValueHelpDialog);

			this._oValueHelpDialog.setRangeKeyFields([{
				label: "BP",
				key: "BP",
				type: "string",
				typeInstance: new typeString({}, {
					maxLength: 7
				})
			}]);

			var oFilterBar = this._oValueHelpDialog.getFilterBar();
			oFilterBar.setFilterBarExpanded(false);
			oFilterBar.setBasicSearch(this._oBasicSearchField);

			this._oValueHelpDialog.getTableAsync().then(function (oTable) {
				oTable.setModel(this.oCustomersModel);
				oTable.setModel(this.oColModel, "columns");

				if (oTable.bindRows) {
					oTable.bindAggregation("rows", {
						path: "/BusinessPartnerSet",
						filters: this.aFilters
					});
				}

				if (oTable.bindItems) {
					oTable.bindAggregation("items", {
						path: "/BusinessPartnerSet",
						filters: this.aFilters
					}, function () {
						return new ColumnListItem({
							cells: aCols.map(function (column) {
								return new Label({ text: "{" + column.template + "}" });
							})
						});
					});
				}

				this._oValueHelpDialog.update();
			}.bind(this));

			//this._oValueHelpDialog.setTokens(this._oMultiInput.getTokens());
			this._oValueHelpDialog.open();
		},

		onValueHelpOkPress: function (oEvent) {
			var aTokens = oEvent.getParameter("tokens");
			
			//this._oInput.setSelectedKey(aTokens[0].getKey());
			
			if (aTokens.length) {	
				
				var sKey = aTokens[0].getKey();	
				var oCustomer = this._getCustomerByKey(sKey);
				//this.oCustomersModel.setProperty("/SelectedCustomer",oCustomer);
				this.oSelectedCustomerModel.setProperty("/SelectedCustomer",oCustomer);
				
				
			}
			
			//this.getView().setModel(this.oCustomersModel);
			this.getView().setModel(this.oSelectedCustomerModel);
			
			this._oValueHelpDialog.close();
		},

		onValueHelpCancelPress: function () {
			this._oValueHelpDialog.close();
		},

		onValueHelpAfterClose: function () {
			this._oValueHelpDialog.destroy();
		},

		onFilterBarSearch: function (oEvent) {
			
			var sSearchQuery = this._oBasicSearchField.getValue(),
				aSelectionSet = oEvent.getParameter("selectionSet");
			var aFilters = aSelectionSet.reduce(function (aResult, oControl) {
				
				var sType = oControl.getMetadata().getName();
				switch(sType){
					case "sap.m.Switch":
							if (oControl.getState()) {
								aResult.push(new Filter({
									path: oControl.getName(),
									operator: FilterOperator.EQ,
									value1: oControl.getState()
								}));
							}
							
							break;
					case "sap.m.Input" :
							if (oControl.getValue()) {
								aResult.push(new Filter({
									path: oControl.getName(),
									operator: FilterOperator.Contains,
									value1: oControl.getValue()
								}));
							}
							
							break;
					
					case "sap.m.CheckBox" :
							if (oControl.getSelected()) {
								aResult.push(new Filter({
									path: oControl.getName(),
									operator: FilterOperator.EQ,
									value1: true
								}));
							}
							
							break;
				}
				return aResult;
			}, []);
			
		
			
			// aFilters.push(new Filter({
			// 	filters: [
			// 		new Filter({ path: "BP", operator: FilterOperator.Contains, value1: sSearchQuery }),
			// 		new Filter({ path: "Name", operator: FilterOperator.Contains, value1: sSearchQuery }),
			// 		new Filter({ path: "Email", operator: FilterOperator.Contains, value1: sSearchQuery }),
			// 		new Filter({ path: "CustomerId", operator: FilterOperator.Contains, value1: sSearchQuery })
					
			// 	],
			// 	and: false
			// }));
		

			if (sSearchQuery) {
			
				aFilters.push(new Filter({
					filters: [
						new Filter({
							path: "FullName",
							operator: FilterOperator.Contains,
							value1: sSearchQuery
						})
					],
					and: false
				}));
			}
			
			if (aFilters.length > 0) {
				this._filterTable(new Filter({
					filters: aFilters,
					and: true
				}));
			} else {
				this._filterTable([]);
			}
		},

		_filterTable: function (oFilter) {
			var oValueHelpDialog = this._oValueHelpDialog;

			oValueHelpDialog.getTableAsync().then(function (oTable) {
				if (oTable.bindRows) {
					oTable.getBinding("rows").filter(oFilter);
				}

				if (oTable.bindItems) {
					oTable.getBinding("items").filter(oFilter);
				}

				oValueHelpDialog.update();
			});
		},

		// #endregion
		_getCustomerByKey: function(sKey) {
				var oData = this.oCustomersModel.getData().Customers;
				
				var index = $.inArray(sKey, $.map(oData, function(n){
				    return n.BP;
				}));
				return this.oCustomersModel.getProperty("/Customers/" + index);
				
			},
	
	});
});