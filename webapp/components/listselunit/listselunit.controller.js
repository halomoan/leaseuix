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
	'sap/ui/model/FilterOperator',
	"refx/leaseuix/model/formatter"
], function (compLibrary, BaseController, JSONModel, typeString, ColumnListItem, Label, SearchField, Token, Filter, FilterOperator,formatter) {
	"use strict";

	return BaseController.extend("refx.leaseuix.components.listselunit.listselunit", {
		formatter: formatter,
		onInit: function () {

			this.oColModel = new JSONModel(sap.ui.require.toUrl("refx/leaseuix/components/selectunit") + "/columns.json");
			this.oRentalUnitsModel = new JSONModel(sap.ui.require.toUrl("refx/leaseuix/mockdata") + "/rentalunitvalues.json");
			this.oSelectedUnits = this.getModel("rentalUnits");
			this.getView().setModel(this.oSelectedUnits);
		},


		onDelete: function(oEvent){
			
			var sPath = oEvent.getParameter("listItem").getBindingContext().getPath();
		
			var iLength = sPath.length;
			var iIndex = sPath.slice(iLength - 1);

			var oModel = this.getView().getModel();
			var oData = oModel.getData(); 
			
			oData.SelectedUnits.splice(iIndex, 1);
			var iTotalSize = 0;
			var iTotalUnits = 0;
			var sSizeUnit = "";
			oData.SelectedUnits.map(function(unit){
				iTotalSize += unit.Size;
				iTotalUnits++;
				sSizeUnit = unit.SizeUnit;
				
			});
			oData.TotalUnits = iTotalUnits;
			oData.TotalSize = iTotalSize;
			oData.SizeUnit = sSizeUnit;
			oModel.setData(oData);
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

			this._oValueHelpDialog.setTokens(this._getListTokens());
			this._oValueHelpDialog.open();
		},

		onValueHelpOkPress: function (oEvent) {
			var aTokens = oEvent.getParameter("tokens");
			var oThis = this;
			
			if (aTokens.length) {	
				oThis.oSelectedUnits.setProperty("/SelectedUnits",[]);
				var iTotalSize = 0;
				var iTotalUnits = 0;
				var sSizeUnit = "";
				
				aTokens.map(function(token){
					var sKey = token.getKey();	
					var oUnit = oThis._getUnitByKey(sKey);
					
					if(oUnit) {
						oThis.oSelectedUnits.getProperty("/SelectedUnits").push(oUnit);
						iTotalUnits++;
						iTotalSize += oUnit.Size;
						sSizeUnit = oUnit.SizeUnit;
					}
				});
				
				oThis.oSelectedUnits.setProperty("/TotalUnits",iTotalUnits);
				oThis.oSelectedUnits.setProperty("/TotalSize",iTotalSize);
				oThis.oSelectedUnits.setProperty("/SizeUnit",sSizeUnit);
				
				//this.byId("selectedunit").getModel().updateBindings(true);
				oThis.getView().setModel(oThis.oSelectedUnits);
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

		_getListTokens: function() {
			var oData = this.getView().getModel().getData();
			
			var aTokens = [];
			oData.SelectedUnits.map(function(unit){
				var oToken = new Token({
					key: unit.UnitId,
					text: unit.Name
				});
				
				aTokens.push(oToken); 
			});
			return aTokens;
		},
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
		},
		
		_getUnitByKey: function(sKey) {
			var oData = this.oRentalUnitsModel.getData().RentalUnits;
			
			var index = $.inArray(sKey, $.map(oData, function(n){
			    return n.UnitId;
			}));
			return this.oRentalUnitsModel.getProperty("/RentalUnits/" + index);
			
		},
	});
});