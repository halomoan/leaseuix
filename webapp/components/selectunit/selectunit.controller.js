sap.ui.define([
	'sap/ui/comp/library',
	'refx/leaseuix/controller/BaseController',
	'sap/ui/model/json/JSONModel',
	'sap/ui/model/type/String',
	'sap/m/ColumnListItem',
	'sap/m/Label',
	'sap/m/SearchField',
	'sap/m/Token',
	'sap/ui/model/Filter',
	'sap/ui/model/FilterOperator',
	"refx/leaseuix/model/formatter"
], function(compLibrary, BaseController, JSONModel, typeString, ColumnListItem, Label, SearchField, Token, Filter, FilterOperator,
	formatter) {
	"use strict";

	return BaseController.extend("refx.leaseuix.components.selectunit.selectunit", {
		formatter: formatter,
		onInit: function() {
			this._oMultiInput = this.getView().byId("rentalUnits");
			this._oMultiInput.addValidator(this._onMultiInputValidate);
			//this._oMultiInput.setTokens(this._getDefaultTokens());
			this.initData();

		},

		initData: function() {
			
			this.oFilterCoCode = new Filter("CompanyCode", FilterOperator.EQ, "1002"); // Filter Company Code
			this.aFilterUnits = []; //Filter Unit Key
			this.oFilter2 = null; //Filter Available
			this.aFilters = [this.oFilterCoCode];
			var viewData = {
				"KeyDate": new Date(),
				"ShowIdx": 0,
				"UnitsName": "-None-",
				"Filter": {
					"AvailNo": {
						value: 0,
						min: 0,
						max: 54
					},
					"AvailUnit": "0"
				}
			};

			this.oGlobalData = this.getModel("globalData");
			this.oGlobalData.setProperty("/KeyDate", new Date());

			this.getView().setModel(new JSONModel(viewData), "viewData");
			
		
			this.oColModel = new JSONModel(sap.ui.require.toUrl("refx/leaseuix/model") + "/rentalunitcolumns.json");
			
			var oModel = this.getOwnerComponent().getModel();
			this.getView().setModel(oModel);

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
				label: "UnitKey",
				key: "UnitKey",
				type: "string",
				typeInstance: new typeString({}, {
					maxLength: 7
				})
			}]);
			
			this._oValueHelpDialog.setTokenDisplayBehaviour(sap.ui.comp.smartfilterbar.DisplayBehaviour.descriptionOnly); 
			this._oValueHelpDialog.setKey("UnitKey");
			this._oValueHelpDialog.setDescriptionKey('UnitText');
  
			var oFilterBar = this._oValueHelpDialog.getFilterBar();
			oFilterBar.setFilterBarExpanded(false);
			oFilterBar.setBasicSearch(this._oBasicSearchField);

			this._oValueHelpDialog.getTableAsync().then(function(oTable) {
				oTable.setModel(this.oRentalUnitsModel);
				oTable.setModel(this.oColModel, "columns");

				if (oTable.bindRows) {
					oTable.bindAggregation("rows", { path: "/RentalUnitSet", filters: [this.oFilterCoCode] } );
				}

				if (oTable.bindItems) {
					oTable.bindAggregation("items", { path: "/RentalUnitSet", filters: [this.oFilterCoCode] }, function() {
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

		onStepChange: function(oEvent) {
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
			
			//Set to Vacant Radio Button
			oModel.setProperty("/ShowIdx", 1);
			this._onShowSelect(1);
		
			oModel.setProperty("/KeyDate", oDate);
			this.oGlobalData.setProperty("/KeyDate",oDate);
			this._updateGridBinding();
		},

		onKeyDateChange: function(oEvent) {

			var oDate = new Date(oEvent.getParameter("value"));

			this.oGlobalData.setProperty("/KeyDate", oDate);

			this._updateGridBinding();

		},
		
		_updateGridBinding: function(){
			var oDate =	this.oGlobalData.getProperty("/KeyDate");

			var oGridList = sap.ui.getCore().byId("__xmlview1--unitGrid");
			if (oGridList) {
				
				var oUnitGridBindingInfo = oGridList.getBindingInfo("items");
				

				if (!oUnitGridBindingInfo.parameters) {
					oUnitGridBindingInfo.parameters = {};
				}
				if (!oUnitGridBindingInfo.parameters.custom) {
					oUnitGridBindingInfo.parameters.custom = {};
				}

				oUnitGridBindingInfo.parameters.custom.at = formatter.yyyyMMdd(oDate);
				
				oUnitGridBindingInfo.filters = this._mergeFilters();
				oGridList.bindItems(oUnitGridBindingInfo);
				
				
			}

		},

		onShowSelect: function(oEvent) {

			var index = oEvent.getParameter("selectedIndex");
			
			this._onShowSelect(index);

			this._updateGridBinding();

		},
		
		_onShowSelect: function(index){
			switch (index) {
				case 0:
					this.oFilter2 = null;

					break;
				case 1:
					this.oFilter2 = new Filter({
						path: "Available",
						operator: FilterOperator.EQ,
						value1: true
					});

					break;
				case 2:
					this.oFilter2 = new Filter({
						path: "Available",
						operator: FilterOperator.EQ,
						value1: false
					});

					break;
			}
		},

		_mergeFilters: function() {
			var aFilters = [];
			var i = 0;

			if (this.aFilters.length > 0) {
				for (i = 0; i < this.aFilters.length; i++) {
					aFilters.push(this.aFilters[i]);
				}

			}

			if (this.aFilterUnits) {
				for (i = 0; i < this.aFilterUnits.length; i++) {
					aFilters.push(this.aFilterUnits[i]);
				}
			}
			
			if (this.oFilter2) {
				aFilters.push(this.oFilter2);
			}

			return aFilters;
		},

		onResetAvail: function() {
			var oModel = this.getView().getModel("viewData");
			oModel.setProperty("/KeyDate", new Date());
			this.oGlobalData.setProperty("/KeyDate", new Date());
			oModel.setProperty("/Filter/AvailNo/value", 0);
			oModel.setProperty("/Filter/AvailUnit", "0");
			oModel.setProperty("/ShowIdx", 0);


			this.aFilterUnits = [];
			this.oFilter2 = null;

			this._updateGridBinding();
		},

		_UpdateDependantControls: function(aTokens) {
			var sUnitsName = "";
		
		

			var aFilters = [];

			for (var i = 0; i < aTokens.length; i++) {
				var sKey = aTokens[i].getKey();
				var sName = aTokens[i].getText();
				if (i < aTokens.length - 1) {
					sUnitsName += sName + " / ";
				} else {
					sUnitsName += sName;
				}
					aFilters.push(
					new Filter({
						path: "UnitKey",
						operator: FilterOperator.EQ,
						value1: sKey
					}));
			}
			this.aFilterUnits = aFilters;

			if (i > 0) {
				this.getView().getModel("viewData").setProperty("/UnitsName", sUnitsName);
				
			} else {
				this.getView().getModel("viewData").setProperty("/UnitsName", "-None-");
				
			}
			
			this._updateGridBinding();

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
						path: "UnitKey",
						operator: FilterOperator.Contains,
						value1: sSearchQuery
					}),
					new Filter({
						path: "UnitText",
						operator: FilterOperator.Contains,
						value1: sSearchQuery
					}),
					new Filter({
						path: "UsageText",
						operator: FilterOperator.Contains,
						value1: sSearchQuery
					}),
					new Filter({
						path: "BuildingText",
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

				oToken.setKey(oObject.UnitKey);
				//oToken.setText(oObject.UnitText + " (" + oObject.UnitKey + ")");
				oToken.setText(oObject.UnitText);
				oToken.setText(oObject.UnitText);
				return oToken;
			}

			return null;
		}
	});
});