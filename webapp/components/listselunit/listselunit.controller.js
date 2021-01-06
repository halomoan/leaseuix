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

			this.oColModel = new JSONModel(sap.ui.require.toUrl("refx/leaseuix/components/listselunit") + "/columns.json");
			
			this._initData();
		},
	
		_initData: function(){
			
			this.oSelectedUnits = new JSONModel({
				"SelectedUnits" : [],
				"TotalUnits" : 0,
				"TotalSize" : 0,
				"SizeUnit" : ""
			});
			
			this.getView().setModel(this.oSelectedUnits,"unitData");
			
			var oGlobalModel = this.getModel("globalData");
			this.BEKey = oGlobalModel.getProperty("/BEKey");
			
			this.CompanyCode = oGlobalModel.getProperty("/CompanyCode");
			this.oFilterCoCode = new Filter("CompanyCode", FilterOperator.EQ, this.CompanyCode); // Filter Company Code
			
			this.BusinessEntity = oGlobalModel.getProperty("/BusinessEntity");
			this.oFilterBE = new Filter("BusinessEntity", FilterOperator.EQ, this.BusinessEntity); // Filter BE
			
			this.aFilters = [this.oFilterCoCode, this.oFilterBE];
		},

		onDelete: function(oEvent){
			
			var sPath = oEvent.getParameter("listItem").getBindingContext("unitData").getPath();
		
			var iLength = sPath.length;
			var iIndex = sPath.slice(iLength - 1);

			var oModel = this.getView().getModel("unitData");
			
			var aSelectedUnits = oModel.getProperty("/SelectedUnits"); 
			
			aSelectedUnits.splice(iIndex, 1);
			var iTotalSize = 0;
			var iTotalUnits = 0;
			var sSizeUnit = "";
			aSelectedUnits.map(function(unit){
				iTotalSize += parseInt(unit.UnitSize,0);
				iTotalUnits++;
				sSizeUnit = unit.SizeUnit;
				
			});
			
			oModel.setProperty("/SelectedUnits",aSelectedUnits);
			oModel.setProperty("/TotalUnits",iTotalUnits);
			oModel.setProperty("/TotalSize",iTotalSize);
			oModel.setProperty("/SizeUnit",sSizeUnit);
			
			var oFormModel = this.getModel("contractForm");
			oFormModel.setProperty("/SelectedUnits",aSelectedUnits);
		},

	
		
		// #region
		onValueHelpRequested: function() {
			
			var oDate = new Date();
			
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
			
		
			
			this._oValueHelpDialog.getTableAsync().then(function (oTable) {
				oTable.setModel(this.oColModel, "columns");

				if (oTable.bindRows) {
					
					oTable.bindAggregation("rows", {
						path: "/RentalUnitSet",
						filters: this.aFilters,
						parameters: {
							custom: {
								at: formatter.yyyyMMdd(oDate)
							}
						}
					});
				}

				if (oTable.bindItems) {
					oTable.bindAggregation("items", {
						path: "/RentalUnitSet",
						filters: this.aFilters,
						parameters: {
							custom: {
								at: formatter.yyyyMMdd(oDate)
							}
						}
					}, function() {
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

			//this._oValueHelpDialog.setTokens(this._getListTokens());
			
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
					
					var oObject = token.data();
					var oUnit = oObject.row;
				
					if(oUnit) {
						oThis.oSelectedUnits.getProperty("/SelectedUnits").push(oUnit);
						iTotalUnits++;
						iTotalSize += parseInt(oUnit.UnitSize,0);
						sSizeUnit = oUnit.SizeUnit;
					}
				});
				
				
				oThis.oSelectedUnits.setProperty("/TotalUnits",iTotalUnits);
				oThis.oSelectedUnits.setProperty("/TotalSize",iTotalSize);
				oThis.oSelectedUnits.setProperty("/SizeUnit",sSizeUnit);
				
				//this.byId("selectedunit").getModel().updateBindings(true);
				
				var oFormModel = this.getModel("contractForm");
				oFormModel.setProperty("/SelectedUnits",oThis.oSelectedUnits.getProperty("/SelectedUnits"));
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
			
			
			if (sSearchQuery) {
			
				aFilters.push(new Filter({
					filters: [
						new Filter({
							path: "UnitText",
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

		_filterTable: function (aFilters) {
			var oValueHelpDialog = this._oValueHelpDialog;

			oValueHelpDialog.getTableAsync().then(function (oTable) {
				if (oTable.bindRows) {
					oTable.getBinding("rows").filter(aFilters);
				}

				if (oTable.bindItems) {
					oTable.getBinding("items").filter(aFilters);
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
					text: unit.UnitText
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
		
		// _getUnitByKey: function(sKey) {
		// 	var oData = this.oRentalUnitsModel.getData().RentalUnits;
			
		// 	var index = $.inArray(sKey, $.map(oData, function(n){
		// 	    return n.UnitId;
		// 	}));
		// 	return this.oRentalUnitsModel.getProperty("/RentalUnits/" + index);
			
		// },
	});
});