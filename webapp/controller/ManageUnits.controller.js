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
	"sap/m/MessageBox",
	"sap/m/MessageToast",
	"sap/m/GroupHeaderListItem",
	"refx/leaseuix/model/formatter"
], function(compLibrary, BaseController, JSONModel, typeString, ColumnListItem, Label,
	SearchField, Token, Filter, FilterOperator, MessageBox, MessageToast, GroupHeaderListItem,
	formatter) {
	"use strict";

	return BaseController.extend("refx.leaseuix.controller.ManageUnits", {
		formatter: formatter,
		_formFragments: {},

		onInit: function() {

			this.oRouter = this.getRouter();
			this.oRouter.getRoute("manageunits").attachMatched(this.__onRouteMatched, this);

		},

		__onRouteMatched: function(oEvent) {

			var oArguments = oEvent.getParameter("arguments");

			this.CompanyCode = oArguments.CompanyCode;
			this.BusinessEntity = oArguments.BusinessEntity;
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
				"IsMultiSelect": false,
				"IsAllowMerge": false,
				"SizeRange": [0, 10000],
				"IsFiltered": false,
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
				"delay": 0,

				"Merge": {
					"Units": [],
					"Name": "",
					"UnitSize": 0,
					"SizeUnit": ""
				}

			};

			var oForm = {
				"CompanyCode": this.CompanyCode,
				"BusinessEntity": this.BusinessEntity,
				"ROType": "RU",
				"UsageType": "",
				"Building": 0,
				"Floor": 0,
				"UnitNo1": 0,
				"UnitNo2": 0,
				"UnitText": "",
				"isRetail": false,
				"isOffice": true
			};

			this.getView().setModel(new JSONModel(oForm), "formData");

			var oMessageManager = sap.ui.getCore().getMessageManager();
			this.getView().setModel(oMessageManager.getMessageModel(), "message");
			oMessageManager.registerObject(this.getView(), true);

			this.oFilterCoCode = new Filter("CompanyCode", FilterOperator.EQ, this.CompanyCode); // Filter Company Code
			if (this.CompanyCode === this.BusinessEntity) {
				this.BusinessEntity = "0000" + this.BusinessEntity;
			}
			this.oFilterBE = new Filter("BusinessEntity", FilterOperator.EQ, this.BusinessEntity); // Filter BE
			this.aFilterUnits = []; //Filter Unit Key
			this.oFilterAvail = null; //Filter Available
			this.oFilterFloor = null;
			this.oFilterContract = null;
			this.oFilterSize = null;
			this.aFilters = [this.oFilterCoCode, this.oFilterBE];

			this.aSort = [new sap.ui.model.Sorter('Floor', false, true)];

			this.oColModel = new JSONModel(sap.ui.require.toUrl("refx/leaseuix/model/") + "/rentalunitcolumns.json");

			var oFloorBinding = this.getView().byId("Floor").getBinding("items");

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

		onAddUnit: function() {
			this.showFormDialogFragment(this.getView(), this._formFragments, "refx.leaseuix.fragments.createunit", this);

			var oBuilding = sap.ui.core.Fragment.byId(this.getView().getId(), "selectBuilding");
			var aFilters = [
				new Filter("CompanyCode", FilterOperator.EQ, this.CompanyCode),
				new Filter("BusinessEntity", FilterOperator.EQ, this.BusinessEntity)
			];
			oBuilding.bindAggregation("items", {
				path: "/BuildingSet",
				template: new sap.ui.core.Item({
					key: "{BuildingID}",
					text: "{BuildingName}"
				}),
				filters: aFilters
			});

		},

		onFloorUnitChange: function(oEvent) {

			var oFormModel = this.getView().getModel("formData");

			var sFloor = sap.ui.core.Fragment.byId(this.getView().getId(), "iFloor").getValue();
			var sUnitNo1 = sap.ui.core.Fragment.byId(this.getView().getId(), "iUnitNo1").getValue();
			var sUnitNo2 = sap.ui.core.Fragment.byId(this.getView().getId(), "iUnitNo2").getValue();

			if (sFloor < 10) {
				sFloor = "0" + sFloor;
			}
			if (sUnitNo1 < 10) {
				sUnitNo1 = "0" + sUnitNo1;
			}

			if (sUnitNo2 < 10) {
				sUnitNo2 = "0" + sUnitNo2;
			}

			if (sUnitNo2 > 0) {
				oFormModel.setProperty("/UnitText", "#" + sFloor + "-" + sUnitNo1 + " to " + sUnitNo2);
			} else {
				oFormModel.setProperty("/UnitText", "#" + sFloor + "-" + sUnitNo1);
			}

		},

		onCreateUnit: function() {
			var oThis = this;
			var oBundle = this.getView().getModel("i18n").getResourceBundle();
			var oModel = this.getModel();
			var oFormData = this.getView().getModel("formData").getData();

			sap.ui.getCore().getMessageManager().removeAllMessages();

			if (this._validateCreateUnit(oFormData)) {

				MessageBox.confirm(oBundle.getText("msgCfrmCreateUnit"), {
					actions: ["Create", MessageBox.Action.CANCEL],
					emphasizedAction: "CANCEL",
					onClose: function(sAction) {
						if (sAction === 'Create') {
							
							oThis.byId("createUnitDialog").close();
							
							var oData = {
								"CompanyCode": oFormData.CompanyCode,
								"BusinessEntity": oFormData.BusinessEntity,
								"ROType": oFormData.ROType,
								"UsageType": oFormData.isRetail ? "0002" : "0001",
								"Building": oFormData.Building,
								"Floor": oFormData.Floor + "",
								"UnitText": oFormData.UnitText,
								"UnitSize": oFormData.UnitSize + ""

							};

							oModel.create("/RentalUnitSet", oData, {
								method: "POST",
								success: function(data) {
									MessageToast.show("New Unit Successfully Created");
								},
								error: function(e) {
									MessageToast.show("Error Detected");
								}
							});

							
						}
						
					}
				});

			}
		},

		_validateCreateUnit: function(oData) {
			var oBundle = this.getView().getModel("i18n").getResourceBundle();

			var oInput = sap.ui.core.Fragment.byId(this.getView().getId(), "iUnitNo1");

			if (oInput.getValue() < 1) {

				MessageBox.error(oBundle.getText("msgErrUnitNo"));
				return false;
			}
			oInput = sap.ui.core.Fragment.byId(this.getView().getId(), "iFloor");
			if (oInput.getValue() < 1) {

				MessageBox.error(oBundle.getText("msgErrFloor"));
				return false;
			}
			oInput = sap.ui.core.Fragment.byId(this.getView().getId(), "iUnitSize");

			if (oInput.getValue() < 1) {

				MessageBox.error(oBundle.getText("msgErrUnitSize"));
				return false;
			}

			if (oData.Building === "" || !oData.Building) {
				MessageBox.error(oBundle.getText("msgErrBuilding"));
				return false;
			}

			return true;
		},

		onMessagePopoverPress: function(oEvent) {
			var oSource = oEvent.getSource();

			this.showPopOverFragment(this.getView(), oSource, this._formFragments, "refx.leaseuix.fragments.messagepopover", this);

		},

		onCancelCreateUnit: function() {
			this.byId("createUnitDialog").close();
		},

		onGoBack: function() {
			this.onNavBack();
		},
		onContractDetail: function(oEvent) {

			var oThis = this;
			var sREContractKey = oEvent.getSource().data('REContractKey');

			var oViewModel = this.getView().getModel("viewData");
			var oSource = oEvent.getSource();

			var oCtx = oEvent.getSource().getBindingContext();

			this.showPopOverFragment(this.getView(), oSource, this._formFragments, "refx.leaseuix.fragments.popcontractdetail", this);

			var oPopOver = sap.ui.core.Fragment.byId(this.getView().getId(), "unitmaster");

			var sPath = oCtx.getPath() + "/Contract";

			var oDate = oViewModel.getProperty("/KeyDate");
			var sDate = formatter.yyyyMMdd(oDate);

			oPopOver.bindElement({
				path: sPath,
				parameters: {
					custom: {
						at: sDate
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

			var oModel = this.getModel();
			oModel.read("/ContractSet('" + sREContractKey + "')/RentalUnitSet/$count", {
				urlParameters: {
					"at": sDate
				},
				success: function(oEvt, oResponse) {
					if (isNaN(oResponse.data)) {
						oThis.getView().byId("NoOfUnits").setText('');
						oThis.getView().byId("UnitIcon").setVisible(false);
					} else {
						oThis.getView().byId("NoOfUnits").setText(oResponse.data);
						oThis.getView().byId("UnitIcon").setVisible(true);

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

		getGroupHeader: function(oGroup) {

			return new GroupHeaderListItem({
				title: oGroup.key
			});
		},
		onGridSelect: function(oEvent) {
			var oViewModel = this.getView().getModel("viewData");
			var oSource = oEvent.getSource();
			var sMode = oSource.getText();

			if (sMode === 'Select') {
				this.byId("unitGrid").setMode('MultiSelect');
				oSource.setText('Deselect');
				oViewModel.setProperty("/IsMultiSelect", true);

				if (this.oFilterFloor) {
					oViewModel.setProperty("/IsAllowMerge", true);
				} else {
					oViewModel.setProperty("/IsAllowMerge", false);
				}
			} else {
				this.byId("unitGrid").setMode('None');
				oSource.setText('Select');
				oViewModel.setProperty("/IsMultiSelect", false);
				oViewModel.setProperty("/IsAllowMerge", false);
			}

		},

		onGridSelectChange: function(oEvent) {
			var bSelected = oEvent.getParameter("selected");
			var oViewModel = this.getView().getModel("viewData");
			var aUnits = oViewModel.getProperty("/Merge/Units");
			var oUnit = oEvent.getParameter("listItem").getBindingContext().getObject();
			if (bSelected) {
				aUnits.push(oUnit);
			} else {
				aUnits = aUnits.filter(function(unit) {
					return unit.UnitKey !== oUnit.UnitKey;
				});
			}

			oViewModel.setProperty("/Merge/Units", aUnits);

		},

		onCreateContract: function(oEvent) {

		},

		onGridViewSetting: function(oEvent) {
			this.showFormDialogFragment(this.getView(), this._formFragments, "refx.leaseuix.fragments.unitsviewsetting", this);
		},

		onSizeRangeChange: function(oEvent) {

			var aRange = oEvent.getSource().getRange();

			this.oFilterSize = new Filter({
				path: "UnitSize",
				operator: FilterOperator.BT,
				value1: aRange[0],
				value2: aRange[1]
			});
		},

		onGridViewSetConfirm: function(oEvent) {

			var oSortItem = oEvent.getParameters().sortItem;

			var sSortBy = oSortItem.getKey();
			var bDescending = oEvent.getParameters().sortDescending;

			if (sSortBy === 'Floor') {
				this.aSort = [new sap.ui.model.Sorter('Floor', bDescending, true)];
			} else {

				this.aSort = [new sap.ui.model.Sorter('Floor', false, true), new sap.ui.model.Sorter(sSortBy, bDescending, false)];
			}

			// var oRangeSlider = oSource.getFilterItems()[0].getCustomControl();
			// var aRange = oRangeSlider.getRange();

			this._updateGridBinding();
		},

		onGridViewSetReset: function(oEvent) {
			var oViewModel = this.getView().getModel("viewData");

			oViewModel.setProperty("/SizeRange", [0, 10000]);
			this.oFilterSize = null;

		},
		onMergeUnits: function() {
			var oViewModel = this.getView().getModel("viewData");
			var aUnits = oViewModel.getProperty("/Merge/Units");

			if (aUnits.length > 0) {
				var sNewName = "";
				var sFloor = "";
				var iUnitSize = 0;
				var sSizeUnit = "";

				for (var i = 0; i < aUnits.length; i++) {
					var aName = aUnits[i].UnitText.split('-');
					if (i === 0) {
						sNewName = aName[1];
					} else {
						sNewName += ' & ' + aName[1];
					}
					sFloor = aName[0];
					iUnitSize += parseInt(aUnits[i].UnitSize, 0);
					if (aUnits[i].UnitSize !== '') {
						sSizeUnit = aUnits[i].SizeUnit;
					}
				}
				sNewName = sFloor + '-' + sNewName;

				oViewModel.setProperty("/Merge/Name", sNewName);
				oViewModel.setProperty("/Merge/UnitSize", iUnitSize);
				oViewModel.setProperty("/Merge/SizeUnit", sSizeUnit);
				this.showFormDialogFragment(this.getView(), this._formFragments, "refx.leaseuix.fragments.unitsmerge", this);
			}
		},
		onDrop: function(oInfo) {
			var oBundle = this.getView().getModel("i18n").getResourceBundle();
			var oViewModel = this.getView().getModel("viewData");

			var oDragged = oInfo.getParameter("draggedControl"),
				oDropped = oInfo.getParameter("droppedControl"),
				sInsertPosition = oInfo.getParameter("dropPosition"),
				oGrid = oDragged.getParent(),
				oModel = this.getView().getModel(),
				aItems = oModel.getProperty("/items"),
				iDragPosition = oGrid.indexOfItem(oDragged),
				iDropPosition = oGrid.indexOfItem(oDropped);

			if (!oDragged.getBindingContext()) {
				return;
			}

			var oDraggedData = oDragged.getBindingContext().getObject();
			var oDroppedData = oDropped.getBindingContext().getObject();

			if (oDraggedData.UnitKey === oDroppedData.UnitKey) {
				return;
			}

			if (!(oDraggedData.Available && oDroppedData.Available)) {
				MessageBox.error(oBundle.getText("msgErrMergeUnits"));
				return;
			}

			// var fragId = this.getView().getId();
			// var sDragBindPath = oDragged.getBindingContext().getPath();
			// var sDropBindPath = oDropped.getBindingContext().getPath();

			// var oUnitsDragForm = sap.ui.core.Fragment.byId(fragId,'UnitsDrag');
			// oUnitsDragForm.bindElement(sDragBindPath);
			// var oUnitsDropForm = sap.ui.core.Fragment.byId(fragId,'UnitsDrop');
			// oUnitsDropForm.bindElement(sDropBindPath);

			var aName1 = oDraggedData.UnitText.split('-');
			var aName2 = oDroppedData.UnitText.split('-');

			var sNewName = aName1[0] + '-' + aName1[1] + ' & ' + aName2[1];
			oViewModel.setProperty("/Merge/Units", [oDraggedData, oDroppedData]);
			oViewModel.setProperty("/Merge/Name", sNewName);
			oViewModel.setProperty("/Merge/UnitSize", parseInt(oDraggedData.UnitSize, 0) + parseInt(oDroppedData.UnitSize, 0));
			oViewModel.setProperty("/Merge/SizeUnit", oDraggedData.SizeUnit === '' ? oDroppedData.SizeUnit : oDraggedData.SizeUnit);

			this.showFormDialogFragment(this.getView(), this._formFragments, "refx.leaseuix.fragments.unitsmerge", this);

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

		confirmMergeUnits: function() {
			MessageBox.confirm("Are You Sure To Merge These Units?", {
				actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
				emphasizedAction: MessageBox.Action.CANCEL,
				onClose: function(sAction) {
					MessageToast.show("Action selected: " + sAction);
				}
			});
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

		onShowContractUnits: function(sREContractKey) {
			this.oFilterContract = new Filter({
				path: "REContractKey",
				operator: FilterOperator.EQ,
				value1: sREContractKey
			});
			this._updateGridBinding();
		},
		onShowContract: function(sREContractKey) {
			this.oRouter.navTo("contractpage", {
				contractId: sREContractKey
			});
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

		onEditUnit: function(oEvent) {
			var oCtx = oEvent.getSource().getBindingContext();
			var oData = oCtx.getObject();
			var oFormModel = this.getView().getModel("formData");
			oFormModel.setProperty("/CompanyCode",oData.CompanyCode);
			oFormModel.setProperty("/BusinessEntity",oData.BusinessEntity);
			oFormModel.setProperty("/ROType",oData.ROType);
			oFormModel.setProperty("/UsageType",oData.UsageType);
			oFormModel.setProperty("/Building",oData.Building);
			oFormModel.setProperty("/Floor",oData.Floor);
			
			var arrUnit = oData.UnitText.match(/\w+/g);
			
			if (arrUnit.length === 4) {
				oFormModel.setProperty("/UnitNo1",arrUnit[1]);
				oFormModel.setProperty("/UnitNo2",arrUnit[3]);	
			} if (arrUnit.length === 2){
				oFormModel.setProperty("/UnitNo1",arrUnit[1]);
				oFormModel.setProperty("/UnitNo2","");	
			}
			
			oFormModel.setProperty("/UnitText",oData.UnitText);
			
			
			if (oData.UsageType === '0002') {
				oFormModel.setProperty("/isRetail",true );
				oFormModel.setProperty("/isOffice",false);
			} else {
				oFormModel.setProperty("/isRetail",false);
				oFormModel.setProperty("/isOffice",true);
			}
			
		},
		onKeyDateChange: function(oEvent) {
			// var oViewModel = this.getView().getModel("viewData");
			// var oDate = new Date(oEvent.getParameter("value"));
			// oViewModel.setProperty("/KeyDate", oDate);
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

			sap.ui.getCore().getMessageManager().removeAllMessages();
			
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
				} else {
					oUnitGridBindingInfo.parameters.custom = {};
				}

				oUnitGridBindingInfo.parameters.custom.at = formatter.yyyyMMdd(oDate);

				oUnitGridBindingInfo.filters = aFilters;
				oUnitGridBindingInfo.sorter = this.aSort;

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

			var oViewModel = this.getView().getModel("viewData");

			oViewModel.setProperty("/IsFiltered", false);

			if (this.aFilterUnits.length > 0) {
				for (i = 0; i < this.aFilterUnits.length; i++) {
					aFilters.push(this.aFilterUnits[i]);
				}

				oViewModel.setProperty("/IsFiltered", true);
			}

			if (this.oFilterAvail) {
				aFilters.push(this.oFilterAvail);
				oViewModel.setProperty("/IsFiltered", true);

			}

			if (this.oFilterFloor) {
				aFilters.push(this.oFilterFloor);
				oViewModel.setProperty("/IsFiltered", true);

			}

			if (this.oFilterSize) {
				aFilters.push(this.oFilterSize);
				oViewModel.setProperty("/IsFiltered", true);

			}

			if (this.oFilterContract) {
				aFilters.push(this.oFilterContract);
				oViewModel.setProperty("/IsFiltered", true);

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
			oViewModel.setProperty("/SizeRange", [0, 10000]);
			oViewModel.setProperty("/IsFiltered", false);

			this._oMultiInput.removeAllTokens();
			oViewModel.setProperty("/UnitsName", "-None-");

			this.aFilterUnits = [];
			this.oFilterAvail = null;
			this.oFilterFloor = null;
			this.oFilterSize = null;
			this.oFilterContract = null;

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
			this.oRouter.detachRouteMatched(this.__onRouteMatched, this);
		}

	});

});