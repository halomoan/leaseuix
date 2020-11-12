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

	return BaseController.extend("refx.leaseuix.components.tableselcontact.tableselcontact", {
		onInit: function () {
		
			this.oColModel = new JSONModel(sap.ui.require.toUrl("refx/leaseuix/components/tableselcontact") + "/columns.json");
			this.oCustomersModel = new JSONModel(sap.ui.require.toUrl("refx/leaseuix/mockdata") + "/contacts.json");
			this.getView().setModel(this.oCustomersModel);
			
			this.oSelectedContacts = this.getModel("selectedContacts");
		},

		onDelete: function(oEvent){
			
			
			var oTable = this.getView().byId("Table1");
			//var aData = this.oCustomersModel.getData().SelectedCustomers;
			var aData = this.oSelectedContacts.getData().SelectedCustomers;
			var aIndices = oTable.getSelectedIndices();	
			
			for ( var i = aIndices.length-1; i >=0; --i) {
				var idx = aIndices[i];
				aData.splice(idx,1);
			}
			
			oTable.clearSelection();
			//this.oCustomersModel.setProperty('/SelectedCustomers',aData);
			this.oSelectedContacts.setProperty('/SelectedCustomers',aData);
			
		},
		
		// #region
		onValueHelpRequested: function() {
			var aCols = this.oColModel.getData().cols;
			this._oBasicSearchField = new SearchField({
				showSearchButton: false
			});

			this._oValueHelpDialog = sap.ui.xmlfragment("refx.leaseuix.components.tableselcontact.tableselcontact", this);
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
					oTable.bindAggregation("rows", "/Customers");
				}

				if (oTable.bindItems) {
					oTable.bindAggregation("items", "/Customers", function () {
						return new ColumnListItem({
							cells: aCols.map(function (column) {
								return new Label({ text: "{" + column.template + "}" });
							})
						});
					});
				}

				this._oValueHelpDialog.update();
			}.bind(this));

			this._oValueHelpDialog.setTokens(this._getListTokens());
			this._oValueHelpDialog.open();
		},

		onValueHelpOkPress: function (oEvent) {
			var aTokens = oEvent.getParameter("tokens");
			var aCustomers = [];
			var oThis = this;
	
			if (aTokens.length) {	
			
				
				aTokens.map(function(token){
					var sKey = token.getKey();	
					var oCustomer = oThis._getCustomerByKey(sKey);
					
					aCustomers.push(oCustomer);
					
				});
				
				//this.oCustomersModel.setProperty("/SelectedCustomers",aCustomers);
				this.oSelectedContacts.setProperty('/SelectedCustomers',aCustomers);
				this.getView().setModel(this.oSelectedContacts);
			}
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
			
		
			
			aFilters.push(new Filter({
				filters: [
					new Filter({ path: "BP", operator: FilterOperator.Contains, value1: sSearchQuery }),
					new Filter({ path: "Name", operator: FilterOperator.Contains, value1: sSearchQuery }),
					new Filter({ path: "Email", operator: FilterOperator.Contains, value1: sSearchQuery }),
					new Filter({ path: "CustomerId", operator: FilterOperator.Contains, value1: sSearchQuery })
					
				],
				and: false
			}));
		

			this._filterTable(new Filter({
				filters: aFilters,
				and: true
			}));
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
		
		_getListTokens: function() {
			var aTokens = [];
			//var aCustomers = this.getView().getModel().getProperty("/SelectedCustomers");
			var aCustomers = this.oSelectedContacts.getProperty("/SelectedCustomers");
			
			if (aCustomers) {
				
				aCustomers.map(function(customer){
					var oToken = new Token({
						key: customer.BP,
						text: customer.Name
					});
					
					aTokens.push(oToken); 
				});
			}
			return aTokens;
		},	
	
	});
});