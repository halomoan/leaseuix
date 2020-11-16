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
	'sap/ui/model/FilterOperator',
	"refx/leaseuix/model/formatter"
], function(compLibrary, Controller, JSONModel, typeString, ColumnListItem, Label, SearchField, Token, Filter, FilterOperator,formatter) {
	"use strict";

	return Controller.extend("refx.leaseuix.components.selectunit.selectunit", {
		formatter: formatter,
		onInit: function() {
			this._oMultiInput = this.getView().byId("rentalUnits");
			this._oMultiInput.addValidator(this._onMultiInputValidate);
			//this._oMultiInput.setTokens(this._getDefaultTokens());
			this.initData();

		},

		initData: function() {
			this.oFilter1 = null;
			this.aFilters = [];
			var viewData = {
				"UnitsName": "-None-",
				"TotalSize": 0,
				"Filter": {
					"AvailDate": null,
					"AvailNo": {
						value: 2,
						min: 0,
						max: 54
					},
					"AvailUnit": "0"
				}
			};
			this.getView().setModel(new JSONModel(viewData),"viewData");

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

			this._oValueHelpDialog.getTableAsync().then(function(oTable) {
				oTable.setModel(this.oRentalUnitsModel);
				oTable.setModel(this.oColModel, "columns");

				if (oTable.bindRows) {
					oTable.bindAggregation("rows", "/RentalUnits");
				}

				if (oTable.bindItems) {
					oTable.bindAggregation("items", "/RentalUnits", function() {
						return new ColumnListItem({
							cells: aCols.map(function(column) {
								return new Label({
									text: "{" + column.template + "}"
								});
							})
						});
					});
				}

				this._oValueHelpDialog.update();
			}.bind(this));

			this._oValueHelpDialog.setTokens(this._oMultiInput.getTokens());
			this._oValueHelpDialog.open();
		},

		onValueHelpOkPress: function(oEvent) {
			var aTokens = oEvent.getParameter("tokens");
			this._oMultiInput.setTokens(aTokens);

			this._UpdateDependantControls(aTokens);

			this._oValueHelpDialog.close();
		},

		onTokenUpdate: function(oEvent) {
			var aRemovedTokens = oEvent.getParameters().removedTokens;
			var aTokens = oEvent.getSource().getTokens();

			for (var i = 0; i < aTokens.length; i++) {
				if (aRemovedTokens.includes(aTokens[i])) {
					aTokens.splice(i, 1);
				}
			}

			this._UpdateDependantControls(aTokens);

		},

		onClearTokens: function(oEvent) {
			this._oMultiInput.removeAllTokens();
			this._oMultiInput.fireTokenUpdate();
		},
		
		onAvailChange: function(oEvent) {
			var oDate = new Date();
			var oModel = this.getView().getModel("viewData");

			var num = oModel.getProperty("/Filter/AvailNo/value");
			var unit = oModel.getProperty("/Filter/AvailUnit");

			switch (unit) {
				case "0":
					oDate.setDate(oDate.getDate() + num * 7);
					break;
				case "1":
					oDate.setMonth(oDate.getMonth() + num);
					break;
				case "2":
					oDate.setYear(oDate.getFullYear() + num);
					break;
			}

			oModel.setProperty("/Filter/AvailDate", formatter.yyyyMMdd(oDate));

		},
			onResetAvail: function() {
			var oModel = this.getView().getModel("viewData");
			oModel.setProperty("/Filter/AvailDate", null);
			oModel.setProperty("/Filter/AvailNo/value", 0);
			oModel.setProperty("/Filter/AvailUnit", "0");
			

			this._setFilterAvail(true);
		},

		onApplyAvail: function() {
			this._setFilterAvail(false);
		},

		_setFilterAvail: function(bReset) {

			if (bReset) {
				var oUnitGridBinding = sap.ui.getCore().byId("__xmlview1--unitGrid").getBinding("items");
				if (oUnitGridBinding) {
					oUnitGridBinding.filter(this.aFilters);	
				}
			} else {
				var oModel = this.getView().getModel("viewData");
				var sKeyDate = oModel.getProperty("/Filter/AvailDate");
				
				var oFilter1 = new sap.ui.model.Filter("EndDate", sap.ui.model.FilterOperator.LT, sKeyDate);
				
				var oUnitGridBinding = sap.ui.getCore().byId("__xmlview1--unitGrid").getBinding("items");
				if (oUnitGridBinding) {
					
					var aFilters = [];
					
					for(var i = 0; i < this.aFilters; i++){
						aFilters.push(this.aFilters[i]);
					}
					aFilters.push(oFilter1);
					
					oUnitGridBinding.filter(aFilters);	
				}
				
			}
		},


		_UpdateDependantControls: function(aTokens) {
			//var aFilters = [];
			var sUnitsName = "";
			var oData = this.oRentalUnitsModel.getData();
			var iTotalSize = 0;
			
			this.aFilters = [];

			for (var i = 0; i < aTokens.length; i++) {
				var sKey = aTokens[i].getKey();
				if (i < aTokens.length - 1) {
					sUnitsName += sKey + " / ";
				} else {
					sUnitsName += sKey;
				}
				this.aFilters.push(
					new Filter({
						path: "UnitId",
						operator: FilterOperator.EQ,
						value1: sKey
					}));
				var oUnit = oData.RentalUnits.find(unit => unit.UnitId === sKey);
				iTotalSize += oUnit.Size;

			}

			if (i > 0) {
				this.getView().getModel("viewData").setProperty("/UnitsName", sUnitsName);
				this.getView().getModel("viewData").setProperty("/TotalSize", iTotalSize);
			} else {
				this.getView().getModel("viewData").setProperty("/UnitsName", "-None-");
				this.getView().getModel("viewData").setProperty("/TotalSize", 0);
			}

			var oUnitGridBinding = sap.ui.getCore().byId("__xmlview1--unitGrid").getBinding("items");

			if (oUnitGridBinding) {

				oUnitGridBinding.filter(this.aFilters);
			}

		},

		onValueHelpCancelPress: function() {
			this._oValueHelpDialog.close();
		},

		onValueHelpAfterClose: function() {
			this._oValueHelpDialog.destroy();
		},

		onFilterBarSearch: function(oEvent) {

			var sSearchQuery = this._oBasicSearchField.getValue(),
				aSelectionSet = oEvent.getParameter("selectionSet");
			var aFilters = aSelectionSet.reduce(function(aResult, oControl) {

				var sType = oControl.getMetadata().getName();
				switch (sType) {
					case "sap.m.Switch":
						if (oControl.getState()) {
							aResult.push(new Filter({
								path: oControl.getName(),
								operator: FilterOperator.EQ,
								value1: oControl.getState()
							}));
						}

						break;
					case "sap.m.Input":
						if (oControl.getValue()) {
							aResult.push(new Filter({
								path: oControl.getName(),
								operator: FilterOperator.Contains,
								value1: oControl.getValue()
							}));
						}

						break;

					case "sap.m.CheckBox":
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
					new Filter({
						path: "UnitId",
						operator: FilterOperator.Contains,
						value1: sSearchQuery
					}),
					new Filter({
						path: "Name",
						operator: FilterOperator.Contains,
						value1: sSearchQuery
					}),
					new Filter({
						path: "MainCategory",
						operator: FilterOperator.Contains,
						value1: sSearchQuery
					}),
					new Filter({
						path: "Category",
						operator: FilterOperator.Contains,
						value1: sSearchQuery
					})

				],
				and: false
			}));

			this._filterTable(new Filter({
				filters: aFilters,
				and: true
			}));
		},

		_filterTable: function(oFilter) {
			var oValueHelpDialog = this._oValueHelpDialog;

			oValueHelpDialog.getTableAsync().then(function(oTable) {
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

		_getDefaultTokens: function() {
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