sap.ui.define([
	'sap/ui/comp/library',
	'sap/ui/core/mvc/Controller',
	'sap/ui/model/json/JSONModel',
	'sap/ui/model/type/String',
	'sap/m/ColumnListItem',
	'sap/m/Label',
	'sap/m/SearchField',
	'sap/m/Token',
	'sap/ui/model/Filter',
	'sap/ui/model/FilterOperator'
], function (compLibrary, Controller, JSONModel, typeString, ColumnListItem, Label, SearchField, Token, Filter, FilterOperator) {
	"use strict";

	return Controller.extend("refx.leaseuix.components.selectunit.selectunit", {
		onInit: function () {
			this._oMultiInput = this.getView().byId("rentalUnits");
			this._oMultiInput.addValidator(this._onMultiInputValidate);
			//this._oMultiInput.setTokens(this._getDefaultTokens());
			this.initData();
		
		},
		
		initData: function(){
			var viewData = {
				"UnitsName": "-None-"
			};
			this.getView().setModel(new JSONModel(viewData));
			
			this.oColModel = new JSONModel(sap.ui.require.toUrl("refx/leaseuix/components/selectunit") + "/columns.json");
			this.oRentalUnitsModel = new JSONModel(sap.ui.require.toUrl("refx/leaseuix/mockdata") + "/rentalunitvalues.json");
			
			this.getView().setModel(this.oRentalUnitsModel);
			
			
		},

		// #region
		onValueHelpRequested: function() {
			var aCols = this.oColModel.getData().cols;
			this._oBasicSearchField = new SearchField({
				showSearchButton: false
			});

			this._oValueHelpDialog = sap.ui.xmlfragment("refx.leaseuix.components.selectunit.selectunit", this);
			this.getView().addDependent(this._oValueHelpDialog);

			this._oValueHelpDialog.setRangeKeyFields([{
				label: "UnitId",
				key: "UnitId",
				type: "string",
				typeInstance: new typeString({}, {
					maxLength: 7
				})
			}]);

			var oFilterBar = this._oValueHelpDialog.getFilterBar();
			oFilterBar.setFilterBarExpanded(false);
			oFilterBar.setBasicSearch(this._oBasicSearchField);

			this._oValueHelpDialog.getTableAsync().then(function (oTable) {
				oTable.setModel(this.oRentalUnitsModel);
				oTable.setModel(this.oColModel, "columns");

				if (oTable.bindRows) {
					oTable.bindAggregation("rows", "/RentalUnits");
				}

				if (oTable.bindItems) {
					oTable.bindAggregation("items", "/RentalUnits", function () {
						return new ColumnListItem({
							cells: aCols.map(function (column) {
								return new Label({ text: "{" + column.template + "}" });
							})
						});
					});
				}

				this._oValueHelpDialog.update();
			}.bind(this));

			this._oValueHelpDialog.setTokens(this._oMultiInput.getTokens());
			this._oValueHelpDialog.open();
		},

		onValueHelpOkPress: function (oEvent) {
			var aTokens = oEvent.getParameter("tokens");
			this._oMultiInput.setTokens(aTokens);
			
			this._UpdateDependantControls(aTokens);
			
			this._oValueHelpDialog.close();
		},
		
		onTokenUpdate: function(oEvent) {
			var aRemovedTokens =  oEvent.getParameters().removedTokens;
			var aTokens = oEvent.getSource().getTokens();
			
			for (var i = 0; i<aTokens.length;i++){
				if( aRemovedTokens.includes(aTokens[i]) ){
					aTokens.splice(i,1);		
				}
			}
			
			this._UpdateDependantControls(aTokens);
			
		},
		
		onClearTokens: function(oEvent){
			this._oMultiInput.removeAllTokens();
			this._oMultiInput.fireTokenUpdate();
		},
		
		_UpdateDependantControls: function(aTokens){
			var aFilters = [];
			var sUnitsName = "";
			var oData = this.oRentalUnitsModel.getData();
			
			console.log(oData.RentalUnits);
			
			for(var i = 0; i< aTokens.length; i++){
				var sKey = aTokens[i].getKey();
					if (i < aTokens.length - 1) {
						sUnitsName += sKey + " / ";
					} else {
						sUnitsName += sKey ;
					}
					aFilters.push(
					new Filter({ path: "UnitId", operator: FilterOperator.EQ, value1: sKey }));
			}
			
			if (i > 0) {
				this.getView().getModel().setProperty("/UnitsName",sUnitsName);
			} else {
				this.getView().getModel().setProperty("/UnitsName","-None-");
			}
			
			var oUnitGridBinding = sap.ui.getCore().byId("__xmlview1--unitGrid").getBinding("items");
			
			if (oUnitGridBinding){
			
				oUnitGridBinding.filter(aFilters);
			}
			
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
					new Filter({ path: "UnitId", operator: FilterOperator.Contains, value1: sSearchQuery }),
					new Filter({ path: "Name", operator: FilterOperator.Contains, value1: sSearchQuery }),
					new Filter({ path: "MainCategory", operator: FilterOperator.Contains, value1: sSearchQuery }),
					new Filter({ path: "Category", operator: FilterOperator.Contains, value1: sSearchQuery })
					
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

		_getDefaultTokens: function () {
			var ValueHelpRangeOperation = compLibrary.valuehelpdialog.ValueHelpRangeOperation;
			var oToken1 = new Token({
				key: "HT-1001",
				text: "Notebook Basic 17 (HT-1001)"
			});

			var oToken2 = new Token({
				key: "range_0",
				text: "!(=HT-1000)"
			}).data("range", {
				"exclude": true,
				"operation": ValueHelpRangeOperation.EQ,
				"keyField": "ProductId",
				"value1": "HT-1000",
				"value2": ""
			});

			return [oToken1, oToken2];
		},

		_onMultiInputValidate: function(oArgs) {
			if (oArgs.suggestionObject) {
				var oObject = oArgs.suggestionObject.getBindingContext().getObject(),
					oToken = new Token();

				oToken.setKey(oObject.UnitId);
				oToken.setText(oObject.Name + " (" + oObject.UnitId + ")");
				return oToken;
			}

			return null;
		}
	});
});