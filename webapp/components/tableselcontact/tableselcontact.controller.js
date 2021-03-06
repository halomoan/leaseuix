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
			// var oGlobalModel = this.getModel("globalData");
			// this.CompanyCode = oGlobalModel.getProperty("/CompanyCode");
			// this.oFilterCoCode = new Filter("CompanyCode", FilterOperator.EQ, this.CompanyCode); // Filter Company Code
			
			this.oFilterBPRole = new Filter("BPRole", FilterOperator.EQ, "BPL002"); // Filter BP Role
			this.aFilters = [this.oFilterBPRole];
			
			this._initData();
		},
		
		_initData: function(){
			this.oSelectedContacts = new JSONModel(
				 [ ]);
			this.getView().setModel(this.oSelectedContacts,"customerData");
		},

		onDelete: function(oEvent){
			
			
			var oTable = this.getView().byId("Table1");
			var aData = this.oSelectedContacts.getData();
			var aIndices = oTable.getSelectedIndices();	
			
			for ( var i = aIndices.length-1; i >=0; --i) {
				var idx = aIndices[i];
				aData.splice(idx,1);
			}
			
			oTable.clearSelection();
			this.oSelectedContacts.setProperty('/',aData);
			
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
				key: "BPID",
				type: "string",
				typeInstance: new typeString({}, {
					maxLength: 7
				})
			}]);
			
			this._oValueHelpDialog.setTokenDisplayBehaviour(sap.ui.comp.smartfilterbar.DisplayBehaviour.descriptionOnly);
			this._oValueHelpDialog.setKey("BPID");
			this._oValueHelpDialog.setDescriptionKey('FullName');
			
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
						},  function () {
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
	
			if (aTokens.length) {	
			
				aTokens.map(function(token){
				
					
					var oObject = token.data();
					var oCustomer = oObject.row;
					
					aCustomers.push(oCustomer);
					
				});
				
				this.oSelectedContacts.setProperty('/',aCustomers);
				
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
		
		_getListTokens: function() {
			var aTokens = [];
			var aCustomers = this.oSelectedContacts.getProperty("/");
			
			if (aCustomers) {
				
				aCustomers.map(function(customer){
					var oToken = new Token({
						key: customer.BPID,
						text: customer.FullName
					});
					
					aTokens.push(oToken); 
				});
			}
			return aTokens;
		},	
	
	});
});