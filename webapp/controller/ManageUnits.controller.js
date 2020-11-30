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

	return BaseController.extend("refx.leaseuix.controller.ManageUnits", {
		formatter: formatter,
		_formFragments: {},
		
		onInit: function() {

			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.getRoute("manageunits").attachMatched(this.__onRouteMatched, this);

		},

		__onRouteMatched: function(oEvent) {
			this._oMultiInput = this.getView().byId("rentalUnits");
			this._oMultiInput.addValidator(this._onMultiInputValidate);

			this.initData();
		},

		initData: function() {
			
			var oViewData = {
				"KeyDate": new Date(),
				"ShowIdx": 0,
				"UnitsName": "-None-",
				"Tenancy": {
					"SizeUnit": "",
					"TSize": 0,
					"TUnits": 0,
					"TOccupiedUnits": 0,
					"TOccupiedSize": 0,
					"TVacantUnits": 0,
					"TVacantSize": 0,
					"POccupiedUnits": 0.0,
					"POccupiedSize": 0.0

				},
				"Floor": "ALL",
				"SizeRange": [0,10000],
				"Filter": {
					"AvailNo": {
						value: 0,
						min: 0,
						max: 54
					},
					"AvailUnit": "0"
				},
				"busy": {
					"popcontract": false
				},
				"delay": 0

			};

			this.CompanyCode = "1001";
			this.BusinessEntity = "00001001";
			this.oFilterCoCode = new Filter("CompanyCode", FilterOperator.EQ, this.CompanyCode); // Filter Company Code
			this.oFilterBE = new Filter("BusinessEntity", FilterOperator.EQ, this.BusinessEntity); // Filter BE
			this.aFilterUnits = []; //Filter Unit Key
			this.oFilterAvail = null; //Filter Available
			this.oFilterFloor = null;
			this.oFilterSize = null;
			this.aFilters = [this.oFilterCoCode, this.oFilterBE];
			
			this.oSort = new sap.ui.model.Sorter('UnitText', false);
		

			this.oColModel = new JSONModel(sap.ui.require.toUrl("refx/leaseuix/model/") + "/rentalunitcolumns.json");

			var oFloorBinding = this.byId("Floor").getBinding("items");
			oFloorBinding.filter([
				this.oFilterCoCode,
				this.oFilterBE
			]);

			this.getOwnerComponent().getModel().metadataLoaded().then(function() {
				var oModel = this.getOwnerComponent().getModel();

				this.getView().setModel(oModel);
			}.bind(this));

			this.getView().setModel(new JSONModel(oViewData), "viewData");

			// this.oGlobalData = this.getModel("globalData");
			// this.getView().setModel(this.oGlobalData, "globalData");

			this._updateGridBinding();

		},

		onContractDetail: function(oEvent) {

			var oViewModel = this.getView().getModel("viewData");
			var oSource = oEvent.getSource();

			var oCtx = oEvent.getSource().getBindingContext();

			this.showPopOverFragment(this.getView(), oSource, this._formFragments, "refx.leaseuix.fragments.popcontractdetail", this);

			var oPopOver = sap.ui.core.Fragment.byId(this.getView().getId(), "unitmaster");

			var sPath = oCtx.getPath() + "/Contract";

			var oDate = oViewModel.getProperty("/KeyDate");

			oPopOver.bindElement({
				path: sPath,
				parameters: {
					custom: {
						at: formatter.yyyyMMdd(oDate)
					}
				},
				events: {
					dataRequested: function() {
						oViewModel.setProperty("/busy/popcontract", true);
					},
					dataReceived: function() {
						oViewModel.setProperty("/busy/popcontract", false);
					}
				}
			});

		},

		_updateTenancyInfo: function(oData) {
			var oViewModel = this.getView().getModel("viewData");
			oViewModel.setProperty("/Tenancy/SizeUnit", oData.SizeUnit);
			oViewModel.setProperty("/Tenancy/TSize", oData.TotalSize);
			oViewModel.setProperty("/Tenancy/TUnits", oData.TotalUnits);
			oViewModel.setProperty("/Tenancy/TOccupiedSize", oData.TOccupiedSize);
			oViewModel.setProperty("/Tenancy/TOccupidUnits", oData.TOccupiedUnits);
			oViewModel.setProperty("/Tenancy/TVacantSize", oData.TVacantSize);
			oViewModel.setProperty("/Tenancy/TVacantUnits", oData.TVacantUnits);
			oViewModel.setProperty("/Tenancy/POccupiedUnits", Math.round((oData.TOccupiedUnits / oData.TotalUnits) * 100));
			oViewModel.setProperty("/Tenancy/POccupiedSize", Math.round((oData.TOccupiedSize / oData.TotalSize) * 100));
		},
		onGridSelect: function(oEvent) {
			var oSource = oEvent.getSource();
			var sMode = oSource.getText();
			if (sMode === 'Select') {
				this.byId("unitGrid").setMode('MultiSelect');
				oSource.setText('Deselect');
			} else {
				this.byId("unitGrid").setMode('None');
				oSource.setText('Select');
			}

		},

		onGridViewSetting: function(oEvent){
			this.showFormDialogFragment(this.getView(), this._formFragments, "refx.leaseuix.fragments.unitsviewsetting", this);
		},
		
		onSizeRangeChange: function(oEvent){
			
			var aRange = oEvent.getSource().getRange();
			
				this.oFilterSize = new Filter({
					path: "UnitSize",
					operator: FilterOperator.BT,
					value1: aRange[0],
					value2: aRange[1]
				});
		},
		
		onGridViewSetConfirm: function(oEvent){
			
			var oSortItem = oEvent.getParameters().sortItem;
		
			var sSortBy = oSortItem.getKey();
			var bDescending = oEvent.getParameters().sortDescending;
		
			this.oSort = new sap.ui.model.Sorter(sSortBy, bDescending);
			
			// var oRangeSlider = oSource.getFilterItems()[0].getCustomControl();
			// var aRange = oRangeSlider.getRange();
				
			this._updateGridBinding();	
		},
		
		onGridViewSetReset: function(oEvent){
			var oViewModel = this.getView().getModel("viewData");
			
			oViewModel.setProperty("/SizeRange",[0,10000]);
			this.oFilterSize = null;
			
			
		},
		
		onDrop: function(oInfo) {
			var oDragged = oInfo.getParameter("draggedControl"),
				oDropped = oInfo.getParameter("droppedControl"),
				sInsertPosition = oInfo.getParameter("dropPosition"),
				oGrid = oDragged.getParent(),
				oModel = this.getView().getModel(),
				aItems = oModel.getProperty("/items"),
				iDragPosition = oGrid.indexOfItem(oDragged),
				iDropPosition = oGrid.indexOfItem(oDropped);

			var oDraggedData = oDragged.getBindingContext().getObject();
			var oDroppedData = oDropped.getBindingContext().getObject();
			console.log(oDraggedData, oDroppedData);

			this.showFormDialogFragment(this.getView(), this._formFragments, "refx.leaseuix.fragments.unitsmerge");

			//console.log(oDragged,oDropped);
			// remove the item
			// var oItem = aItems[iDragPosition];
			// aItems.splice(iDragPosition, 1);

			// if (iDragPosition < iDropPosition) {
			// 	iDropPosition--;
			// }

			// // insert the control in target aggregation
			// if (sInsertPosition === "Before") {
			// 	aItems.splice(iDropPosition, 0, oItem);
			// } else {
			// 	aItems.splice(iDropPosition + 1, 0, oItem);
			// }

			// oModel.setProperty("/items", aItems);
		},

		closeMergeUnits: function() {
			this.byId("mergeUnitsDialog").close();
		},
		cancelMergeUnits: function() {
			this.byId("mergeUnitsDialog").close();
		},

		// #region - Select Unit Panel

		onValueHelpRequested: function() {

			var oDate = this.getView().getModel("viewData").getProperty("/KeyDate");

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
			// this.oGlobalData.setProperty("/KeyDate",oDate);
			this._updateGridBinding();
		},

		onFloorChange: function(oEvent) {
			var oViewModel = this.getView().getModel("viewData");
			var sFloor = oViewModel.getProperty("/Floor");

			if (sFloor !== 'ALL') {
				this.oFilterFloor = new Filter({
					path: "Floor",
					operator: FilterOperator.EQ,
					value1: sFloor
				});
			} else {
				this.oFilterFloor = null;
			}
			this._updateGridBinding();
		},

		onKeyDateChange: function(oEvent) {
			var oViewModel = this.getView().getModel("viewData");
			var oDate = new Date(oEvent.getParameter("value"));
			oViewModel.setProperty("/KeyDate", oDate);
			// this.oGlobalData.setProperty("/KeyDate", oDate);

			this._updateGridBinding();

		},

		_updateGridBinding: function() {

			var oThis = this;
			var oDate = this.getView().getModel("viewData").getProperty("/KeyDate");

			var oModel = this.getOwnerComponent().getModel();

			// var sKeys = "(CompanyCode='" + this.CompanyCode + "',BusinessEntity='" + this.BusinessEntity + "')";
			// //console.log(sKeys + "?at=" + formatter.yyyyMMdd(oDate) );

			// oModel.read("/RentalUnitStatSet" + sKeys + "?at=" + formatter.yyyyMMdd(oDate) , {
			// 	success: function(oData, oResponse) {
			// 		oThis._updateTenancyInfo(oData);
			// 	},
			// 	error: function(oError) {
			// 	}
			// });

			//var sParams = this._getUrlFilters();
			var aFilters = this._mergeFilters();

			oModel.read("/RentalUnitStatSet", {
				urlParameters: {
					"at": formatter.yyyyMMdd(oDate)
				},
				filters: aFilters,
				success: function(oData, oResponse) {

					oThis._updateTenancyInfo(oData.results[0]);
				},
				error: function(oError) {

				}
			});

			var oGridList = this.byId("unitGrid");
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
				oUnitGridBindingInfo.sorter = this.oSort;
				
				oGridList.bindItems(oUnitGridBindingInfo);

			}

		},

		onShowSelect: function(oEvent) {

			var index = oEvent.getParameter("selectedIndex");

			this._onShowSelect(index);

			this._updateGridBinding();

		},

		_onShowSelect: function(index) {
			switch (index) {
				case 0:
					this.oFilterAvail = null;

					break;
				case 1:
					this.oFilterAvail = new Filter({
						path: "Available",
						operator: FilterOperator.EQ,
						value1: true
					});

					break;
				case 2:
					this.oFilterAvail = new Filter({
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

			if (this.oFilterAvail) {
				aFilters.push(this.oFilterAvail);
			}

			if (this.oFilterFloor) {
				aFilters.push(this.oFilterFloor);
			}
			
			if (this.oFilterSize) {
				aFilters.push(this.oFilterSize);
			}

			return aFilters;
		},

		_getUrlFilters: function() {
			var i = 0;
			var oModel = this.getView().getModel("viewData");
			var sAt = formatter.yyyyMMdd(oModel.getProperty("/KeyDate"));
			var sFilter = "&$filter=";
			if (this.aFilters.length > 0) {

				for (i = 0; i < this.aFilters.length; i++) {

					if (i === 0) {
						sFilter += this.aFilters[i].sPath + " " + this.aFilters[i].sOperator.toLowerCase() + " '" + this.aFilters[i].oValue1 + "'";
					} else {
						sFilter += " and " + this.aFilters[i].sPath + " " + this.aFilters[i].sOperator.toLowerCase() + " '" + this.aFilters[i].oValue1 +
							"'";
					}
					//console.log(this.aFilters[i].sPath, this.aFilters[i].sOperator,this.aFilters[i].oValue1);
				}
			}

			if (this.aFilterUnits) {

				for (i = 0; i < this.aFilterUnits.length; i++) {

					if (i === 0) {
						sFilter += this.aFilterUnits[i].sPath + " " + this.aFilterUnits[i].sOperator.toLowerCase() + " '" + this.aFilterUnits[i].oValue1 +
							"'";
					} else {
						sFilter += " and " + this.aFilterUnits[i].sPath + " " + this.aFilterUnits[i].sOperator.toLowerCase() + " '" + this.aFilterUnits[
							i].oValue1 + "'";
					}
					//console.log(this.aFilterUnits[i].sPath, this.aFilterUnits[i].sOperator,this.aFilterUnits[i].oValue1);
				}
			}
			var sParams = "?at=" + sAt + sFilter;

			return sParams;

		},

		onReset: function() {
			var oViewModel = this.getView().getModel("viewData");
			oViewModel.setProperty("/KeyDate", new Date());
			oViewModel.setProperty("/Filter/AvailNo/value", 0);
			oViewModel.setProperty("/Filter/AvailUnit", "0");
			oViewModel.setProperty("/ShowIdx", 0);
			oViewModel.setProperty("/Floor", "ALL");
			oViewModel.setProperty("/SizeRange", [0,10000]);
			
			this._oMultiInput.removeAllTokens();
			oViewModel.setProperty("/UnitsName", "-None-");

			this.aFilterUnits = [];
			this.oFilterAvail = null;
			this.oFilterFloor = null;
			this.oFilterSize = null;
			
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

			// aFilters.push(new Filter({
			// 	filters: [
			// 		new Filter({
			// 			path: "UnitKey",
			// 			operator: FilterOperator.Contains,
			// 			value1: sSearchQuery
			// 		}),
			// 		new Filter({
			// 			path: "UnitText",
			// 			operator: FilterOperator.Contains,
			// 			value1: sSearchQuery
			// 		}),
			// 		new Filter({
			// 			path: "UsageText",
			// 			operator: FilterOperator.Contains,
			// 			value1: sSearchQuery
			// 		}),
			// 		new Filter({
			// 			path: "ContractNo",
			// 			operator: FilterOperator.Contains,
			// 			value1: sSearchQuery
			// 		})

			// 	],
			// 	and: false
			// }));

			if (aFilters.length > 0) {
				this._filterTable(new Filter({
					filters: aFilters,
					and: true
				}));
			} else {
				this._filterTable([]);
			}
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
		},

		// #endregion

		onExit: function() {
			this.removeFragment(this._formFragments);
			console.log("exit");
		}

	});

});