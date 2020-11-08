sap.ui.define([
	"refx/leaseuix/controller/BaseController",
	'sap/ui/model/json/JSONModel',
	"sap/ui/core/Fragment",
	"sap/m/MessageBox",
	"sap/m/MessageToast",
	"sap/ui/core/dnd/DragInfo",
	"sap/ui/core/dnd/DropInfo",
	"sap/ui/core/dnd/DropPosition",
	"sap/ui/core/dnd/DropLayout",
	"sap/f/dnd/GridDropInfo",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"refx/leaseuix/model/formatter"
], function(BaseController, JSONModel, Fragment, MessageBox, MessageToast, DragInfo, DropInfo, DropPosition, DropLayout, GridDropInfo,
	Filter, FilterOperator, formatter) {
	"use strict";

	return BaseController.extend("refx.leaseuix.components.gridcondition.gridcondition", {
		formatter: formatter,
		_formFragments: {},

		onInit: function() {
			this.initData();
			this._attachDragAndDrop();
		},
		initData: function() {
			var viewData = {
				"stdwzd": {
					"showOK": false
				},
				"stgwzd": {
					"showOK": false,
					"showNext": true,
					"showPrev": false,
					"showError": false,
					"index": 0,
					"max": 1,
					"conds": []
				},
				"formdata": {},
				"condgroup": {}
			};
			this.getView().setModel(new JSONModel(viewData));

			this.oConditionValuesModel = new JSONModel(sap.ui.require.toUrl("refx/leaseuix/mockdata") + "/condformvalues.json");
			this.oConditionModel = new JSONModel(sap.ui.require.toUrl("refx/leaseuix/mockdata") + "/conditions.json");
			this.byId("grid1").setModel(this.oConditionModel);

			this.getView().setModel(this.oConditionValuesModel, "condformvalues");

			this._DateSort = 1;
		},

		onMenuAction: function(oEvent) {
			var oItem = oEvent.getParameter("item"),
				sItemPath = "";

			while (oItem instanceof sap.m.MenuItem) {

				var sId = oItem.getId();
				sId = sId.substring(sId.length - 4, sId.length);

				switch (sId) {
					case "wzd1":
						this.openStdWizardFrom();
						break;
					case "wzd2":
						this.openstgWizardForm();
						break;
				}

				oItem = oItem.getParent();
			}

		},

		onDelete: function(oEvent) {
			var sPath = oEvent.getSource().getBindingContext().getPath();
			var oModel = oEvent.getSource().getModel();
			var oData = oModel.getData();
			var idx = sPath.split('/')[1];

			var oViewModel = this.getView().getModel("condformvalues");

			var sText = "Are you sure to remove this condition ?";

			MessageBox.confirm(sText, {
				title: "Confirmation",
				initialFocus: MessageBox.Action.CANCEL,
				onClose: function(sButton) {
					if (sButton === MessageBox.Action.OK) {

						var oItem = oData.splice(idx, 1);
						oModel.refresh();

						var oCondList = oViewModel.getProperty("/condlist");
						oCondList.push(oItem[0]);
						oViewModel.refresh();

					}
					// else if (sButton === MessageBox.Action.CANCEL) {
					//     console.log('A');
					// } else if (sButton === "Custom Button") {
					//   console.log('B');
					// }
				}
			});

		},

		onSearch: function(oEvent) {
			// add filter for search
			var aFilters = [];
			var sQuery = oEvent.getSource().getValue();
			if (sQuery && sQuery.length > 0) {

				var filter = new Filter({
					filters: [
						new Filter("id", FilterOperator.Contains, sQuery),
						new Filter("title", FilterOperator.Contains, sQuery),
					],
					and: false,
				});
				aFilters.push(filter);
			}

			// update list binding
			var oList = this.byId("list1");
			var oBinding = oList.getBinding("items");
			oBinding.filter(aFilters, "Application");
		},

		onItemEdit: function(oEvent) {
			var sPath = oEvent.getSource().getBindingContext().getPath();
			var oModel = oEvent.getSource().getModel();

			var oData = oModel.getProperty(sPath);

			var idx = sPath.indexOf("/", 1);
			var sPathHeader = sPath.substring(0, idx);
			var oCondGroup = this.byId("grid1").getModel().getProperty(sPathHeader);

			var oCondition = {};
			Object.keys(oCondGroup).forEach(key => {
				oCondition[key] = oCondGroup[key];
			});
			oCondition["cond"] = [oData];

			this.getView().getModel().setProperty("/condgroup", oCondGroup);
			this.getView().getModel().setProperty("/formdata", oCondition);

			this.openConditionForm();

		},
		onItemAdd: function(oEvent) {

			var oVModel = this.getView().getModel("condformvalues");
			var oNewItem = {...oVModel.getData().conditem
			};

			var sPath = oEvent.getSource().getBindingContext().getPath();
			var oModel = oEvent.getSource().getModel();
			var oCondGroup = oModel.getProperty(sPath);

			var iIndex = oCondGroup.cond.length - 1;

			if (iIndex >= 0) {

				oNewItem.id = oCondGroup.cond[iIndex].id + 1;
				oNewItem.curr = oCondGroup.cond[iIndex].curr;
			} else {

				oNewItem.curr = oVModel.getData().currency;

			}

			oCondGroup.cond.push(oNewItem);

			var oCondition = {};
			Object.keys(oCondGroup).forEach(key => {
				oCondition[key] = oCondGroup[key];
			});
			oCondition["cond"] = [oCondGroup.cond[iIndex + 1]];

			this.getView().getModel().setProperty("/condgroup", oCondGroup);
			this.getView().getModel().setProperty("/formdata", oCondition);

			this.openConditionForm();

		},

		_getHightlight: function(sFromDate, sToDate) {
			var oFromDate = new Date(this.formatter.yyyy_MM_dd(sFromDate));
			var oToDate = new Date(this.formatter.yyyy_MM_dd(sToDate));
			var oNow = new Date();

			if (oNow >= oFromDate && oNow <= oToDate) {

				const diffTime = oToDate - oNow;
				const diffDays = Math.ceil(diffTime / 86400000);
				if (diffDays <= 30) {
					return "Warning";
				} else {
					return "Success";
				}
			} else if (oNow < oFromDate) {
				return "Success";
			} else if (oNow > oToDate) {
				return "Error";
			} else {
				return "None";
			}
		},

		onItemDelete: function(oEvent) {

			var sPath = oEvent.getSource().getBindingContext().getPath();
			var idx = sPath.split('/')[3];
			var oModel = oEvent.getSource().getModel();
			var oData = oModel.getData();

			var sText = "Are you sure to delete ?";

			MessageBox.confirm(sText, {
				title: "Confirmation",
				initialFocus: MessageBox.Action.CANCEL,
				onClose: function(sButton) {
					if (sButton === MessageBox.Action.OK) {
						oData[0].cond.splice(idx, 1);
						oModel.refresh();
					}
					// else if (sButton === MessageBox.Action.CANCEL) {
					//     console.log('A');
					// } else if (sButton === "Custom Button") {
					//   console.log('B');
					// .}
				}
			});
		},
		// onValidateFieldGroup: function(oEvent) {

		// 	$('input[aria-required=true]').each(function(){
		// 		console.log(this.id);	
		// 	});

		// },
		openStdWizardFrom: function() {

			this.showFormDialogFragment(this.getView(), this._formFragments, "refx.leaseuix.components.gridcondition.standardwizard");
			var navCon = this.byId("navStdWzd");
			navCon.to(this.byId("stdForm0"), "show");
		},
		openstgWizardForm: function() {
			var oView = this.getView();

			var oTemplateCond = {...oView.getModel("condformvalues").getProperty("/condition")
			};
			const max = this.getView().getModel("condformvalues").getProperty("/maxstaggered");
			var aStgItems = [];
			for (var i = 1; i <= max; i++) {
				aStgItems.push({
					"id": i,
					"text": i
				});
			}

			oView.getModel().setProperty("/stgwzd/stgItems", aStgItems);
			oView.getModel().setProperty("/condgroup", oTemplateCond);
			oView.getModel().setProperty("/stgwzd/index", 0);
			oView.getModel().setProperty("/stgwzd/showOK", false);
			oView.getModel().setProperty("/stgwzd/conds", []);

			this.showFormDialogFragment(this.getView(), this._formFragments, "refx.leaseuix.components.gridcondition.staggeredwizard");
			var navCon = this.byId("navStgWzd");
			navCon.to(this.byId("stgForm0"), "show");
		},
		openConditionForm: function() {
			var oView = this.getView();

			this._formDataOri = {...oView.getModel().getProperty("/formdata")
			};
			this.showFormDialogFragment(this.getView(), this._formFragments, "refx.leaseuix.components.gridcondition.conditionDialog");
		},

		cancelDialog: function() {
			var oData = this.getView().getModel().getProperty("/formdata");

			for (var key in this._formDataOri) {
				oData[key] = this._formDataOri[key];
			}

			//this.byId("grid1").getModel().refresh();
			this.byId("conditionDialog").close();

		},
		onStgWzdNext: function(oEvent) {

			//Staggered Wizard

			var oView = this.getView();
			var navCon = this.byId("navStgWzd");
			var target = oEvent.getSource().data("target");

			if (target) {

				var index = oView.getModel().getProperty("/stgwzd/index");
				var max = oView.getModel().getProperty("/stgwzd/max");
				var aConditions = oView.getModel().getProperty("/stgwzd/conds");

				var oCondGroup = this.getView().getModel().getProperty("/condgroup");

				if (index != 0) {
					var oStatus = this._validForm("stgForm");
					if (oStatus.hasError) {
						MessageToast.show(oStatus.msg);
						return;
					}
				}

				if (target === "stgForm1") {

					index = index + 1;

					if (index <= max) {

						var oCondition = aConditions[index - 1];

						if (!oCondition) {

							if (aConditions.length === 0) {
								var oTemplateCond = oView.getModel("condformvalues").getProperty("/condition");
								oCondition = JSON.parse(JSON.stringify(oTemplateCond));
							} else {
								oCondition = JSON.parse(JSON.stringify(aConditions[index - 2]));
							}

							//aConditions[index - 1] = oCondition;
							aConditions.push(oCondition);

							this._stgWzdDefaultValue(aConditions, index - 1);
							oView.getModel().setProperty("/stgwzd/conds", aConditions);
						}
						oView.getModel().setProperty("/formdata", oCondition);
						oView.getModel().setProperty("/stgwzd/index", index);
						oCondition.cond[0].id = index;
						oCondGroup.cond[index - 1] = oCondition.cond[0];
						this.getView().getModel().setProperty("/condgroup", oCondGroup);

					}

					if (index === 1) {

						navCon.to(this.byId(target), "slide");

					}
				} else if (target === "back") {
					index = index - 1;
					if (index > 0) {
						var oCondition = aConditions[index - 1];
						if (oCondition) {
							oView.getModel().setProperty("/formdata", oCondition);

						}
						oView.getModel().setProperty("/stgwzd/index", index);

					}
				}

				oView.getModel().setProperty("/stgwzd/showNext", (index < max));
				oView.getModel().setProperty("/stgwzd/showPrev", (index > 1));
				oView.getModel().setProperty("/stgwzd/showOK", (index == max && index > 0));

			} else {
				navCon.back();
			}
		},

		_stgWzdDefaultValue: function(aConditions, index) {

			if (index > 0) {

				var sToDate = aConditions[index - 1].cond[0].toDate;

				var oDate = new Date(this.formatter.yyyy_MM_dd(sToDate));
				oDate.setDate(oDate.getDate() + 1);
				aConditions[index].cond[0].fromDate = this.formatter.yyyyMMdd(oDate);
				oDate.setDate(oDate.getDate() + 29);
				aConditions[index].cond[0].toDate = this.formatter.yyyyMMdd(oDate);

			}

		},
		onStdWzdNext: function(oEvent) {
			var navCon = this.byId("navStdWzd");
			var oModel = this.getView().getModel("condformvalues");
			var oData = oModel.getProperty("/stdWizard");

			var target = oEvent.getSource().data("target");
			if (target) {
				var idx = parseInt(target.charAt(target.length - 1));

				if (idx === (oData.length - 1)) {

					this.getView().getModel().setProperty("/stdwzd/showOK", true);
				} else {
					this.getView().getModel().setProperty("/stdwzd/showOK", false);
				}
				navCon.to(this.byId(target), "slide");
			} else {
				navCon.back();
			}
		},
		closeStdWizard: function() {
			//Standard Wizard
			var oModel = this.getView().getModel("condformvalues");

			var oData = oModel.getProperty("/stdWizard").filter(item => !item.dontapply);

			this.byId("grid1").getModel().setProperty("/", oData);

			this.byId("stdWizardDialog").close();
		},
		closeStgWizard: function() {
			//Staggered Wizard
			if (!this._validForm("stgForm").hasError) {
				var aConditions = this.getView().getModel().getProperty("/stgwzd/conds");
				var oData = JSON.parse(JSON.stringify(aConditions[0]));

				oData.cond[0].highlight = this._getHightlight(oData.cond[0].fromDate, oData.cond[0].toDate);
				for (var i = 1; i < aConditions.length; i++) {
					aConditions[i].cond[0].highlight = this._getHightlight(aConditions[i].cond[0].fromDate, aConditions[i].cond[0].toDate);
					oData.cond.push(aConditions[i].cond[0]);
				}

				this.byId("grid1").getModel().setProperty("/", [oData]);
				this.byId("stgWizardDialog").close();
			}

		},
		cancelStdWizard: function() {

			this.byId("stdWizardDialog").close();
		},

		cancelStgWizard: function() {

			this.byId("stgWizardDialog").close();
		},

		closeDialog: function() {
			var oStatus = this._validForm("form0");

			if (!oStatus.hasError) {
				this.byId("grid1").getModel().refresh();
				this.byId("conditionDialog").close();
			} else {
				MessageToast.show(oStatus.msg);
			}
		},

		validNoStaggered: function(oEvent) {
			const oControl = oEvent.getSource();
			const val = oControl.getValue();
			const max = this.getView().getModel("condformvalues").getProperty("/maxstaggered");

			if (val < 1 || val > max) {
				oControl.setValueState(sap.ui.core.ValueState.Error);
				this.getView().getModel().setProperty("/stgwzd/showError", true);
			} else {
				oControl.setValueState(sap.ui.core.ValueState.None);
				this.getView().getModel().setProperty("/stgwzd/showError", false);
			}
		},
		_validForm: function(fragname) {
			var oData = this.getView().getModel().getProperty("/formdata").cond[0];
			var fragId = this.getView().getId();
			var oStatus = {
				"hasError": false,
				"msg": ""
			};

			var formId = fragname + "--";

			var requiredInputs = ['fromDate', 'toDate', 'condpurpose', 'amount'];

			requiredInputs.forEach(function(control) {
				var oControl = sap.ui.core.Fragment.byId(fragId, formId + control);

				//var sType = oControl.getBinding("value").getType().getName();

				if (control === "amount") {
					if (oControl.getValue() <= 0) {
						oControl.setValueState(sap.ui.core.ValueState.Error);
						oStatus.hasError = true;
						oStatus.msg = "Invalid Entry Detected";
					} else {
						oControl.setValueState(sap.ui.core.ValueState.None);
					}
				} else {
					if (oControl.getValue() === "") {
						oControl.setValueState(sap.ui.core.ValueState.Error);
						oStatus.hasError = true;
						oStatus.msg = "Invalid Entry Detected";
					} else {
						oControl.setValueState(sap.ui.core.ValueState.None);
					}
				}

			});

			if (oData.fromDate > oData.toDate) {
				oStatus.hasError = true;
				oStatus.msg = "From Date cannot be later than To Date";

				sap.ui.core.Fragment.byId(fragId, formId + "fromDate").setValueState(sap.ui.core.ValueState.Error);

			} else {
				sap.ui.core.Fragment.byId(fragId, formId + "fromDate").setValueState(sap.ui.core.ValueState.None);
			}

			var oCondGroup = this.getView().getModel().getProperty("/condgroup");

			oCondGroup.cond.forEach(function(cond) {

				if (cond.id != oData.id && cond.condpurposeid === oData.condpurposeid) {

					var bOverlap = (oData.fromDate >= cond.fromDate) && (oData.fromDate <= cond.toDate) ||
						(cond.fromDate >= oData.fromDate) && (cond.fromDate <= oData.toDate);

					if (bOverlap) {
						oStatus.hasError = true;
						oStatus.msg = "Selected Date Range is Overlapping with Existing Condition";

						sap.ui.core.Fragment.byId(fragId, formId + "fromDate").setValueState(sap.ui.core.ValueState.Error);
						sap.ui.core.Fragment.byId(fragId, formId + "toDate").setValueState(sap.ui.core.ValueState.Error);
					} else {
						sap.ui.core.Fragment.byId(fragId, formId + "fromDate").setValueState(sap.ui.core.ValueState.None);
						sap.ui.core.Fragment.byId(fragId, formId + "toDate").setValueState(sap.ui.core.ValueState.None);
					}

				}
			})

			oData.highlight = this._getHightlight(oData.fromDate, oData.toDate);
			return oStatus;

		},

		onDateSort: function(oEvent) {
			var sPath = oEvent.getSource().getBindingContext().getPath();
			var oData = oEvent.getSource().getModel().getProperty(sPath);

			var aData = oData.cond;

			this._DateSort = -1 * this._DateSort;
			aData.sort((a, b) =>

				(parseInt(a.fromDate) > parseInt(b.fromDate)) ? 1 * this._DateSort : -1 * this._DateSort
			);

			// if (this._DateSort > 0) {
			// 	oEvent.getSource().setTooltip("Sort By Date Ascending");
			// } else {
			// 	oEvent.getSource().setTooltip("Sort by Date Descending");
			// }
			oEvent.getSource().getModel().refresh();
		},

		// onCondFormChange: function(oEvent){
		// 	var sControlType = oEvent.getSource().getMetadata().getName();

		// 	switch(sControlType){
		// case "sap.m.ComboBox":

		// 	break;
		// 	}			
		// 	// console.log(oEvent.getSource());
		// 	// console.log(oEvent.getSource().getMetadata());
		// },

		_attachDragAndDrop: function() {
			var oList = this.byId("list1");
			oList.addDragDropConfig(new DragInfo({
				sourceAggregation: "items"
			}));

			oList.addDragDropConfig(new DropInfo({
				targetAggregation: "items",
				dropPosition: DropPosition.Between,
				dropLayout: DropLayout.Vertical,
				drop: this._onDrop.bind(this)
			}));

			var oGrid = this.byId("grid1");
			oGrid.addDragDropConfig(new DragInfo({
				sourceAggregation: "items"
			}));

			oGrid.addDragDropConfig(new GridDropInfo({
				targetAggregation: "items",
				dropPosition: DropPosition.Between,
				dropLayout: DropLayout.Horizontal,
				dropIndicatorSize: this._onDropIndicatorSize.bind(this),
				drop: this._onDrop.bind(this)
			}));
		},

		_onDropIndicatorSize: function(oDraggedControl) {

			if (oDraggedControl.isA("sap.m.StandardListItem")) {
				var oBindingContext = oDraggedControl.getBindingContext("condformvalues"),
					oData = oBindingContext.getModel().getProperty(oBindingContext.getPath());

				return {
					rows: oData.rows,
					columns: oData.columns
				};
			}
			// else {
			// 	var oBindingContext = oDraggedControl.getBindingContext(),
			// 	oData = oBindingContext.getModel().getProperty(oBindingContext.getPath());
			// }
		},
		_onDrop: function(oInfo) {
			var oDragged = oInfo.getParameter("draggedControl"),
				oDropped = oInfo.getParameter("droppedControl"),
				sInsertPosition = oInfo.getParameter("dropPosition"),

				oDragContainer = oDragged.getParent(),
				oDropContainer = oInfo.getSource().getParent();

			var oDragModel, oDragModelData, oDropModel, oDropModelData;

			if (oDragged.isA("sap.m.StandardListItem")) {
				oDragModel = oDragContainer.getModel("condformvalues");
				oDragModelData = oDragModel.getData().condlist;

			} else {
				oDragModel = oDragContainer.getModel();
				oDragModelData = oDragModel.getData();

			}

			if (oDropped && oDropped.isA("sap.m.StandardListItem")) {
				oDropModel = oDropContainer.getModel("condformvalues");
				oDropModelData = oDropModel.getData().condlist;

			} else {
				oDropModel = oDropContainer.getModel();
				oDropModelData = oDropModel.getData();

			}

			var iDragPosition = oDragContainer.indexOfItem(oDragged),
				iDropPosition = oDropContainer.indexOfItem(oDropped);

			// remove the item
			var oItem = oDragModelData[iDragPosition];

			if (oDragModel !== oDropModel && this._isCardExist(oItem.id)) {
				MessageBox.error("Duplicate Condition Type detected !");
				return false;
			}

			oDragModelData.splice(iDragPosition, 1);

			if (oDragModel === oDropModel && iDragPosition < iDropPosition) {
				iDropPosition--;
			}

			if (sInsertPosition === "After") {
				iDropPosition++;
			}

			// insert the control in target aggregation
			oDropModelData.splice(iDropPosition, 0, oItem);

			if (oDragModel !== oDropModel) {
				if (oDragged.isA("sap.m.StandardListItem")) {

					oDragModel.setData(oDragModelData, "condformvalues");
					oDropModel.setData(oDropModelData);

				} else {
					oDragModel.setData(oDragModelData, "");
					oDropModel.setData(oDropModelData, "condformvalues");
				}
			} else {
				if (oDropped && oDropped.isA("sap.m.StandardListItem")) {
					oDropModel.setData(oDropModelData, "condformvalues");
				} else {
					oDropModel.setData(oDropModelData);
				}
			}

			this.byId("grid1").focusItem(iDropPosition);
		},

		_isCardExist: function(sKey) {
			var oData = this.byId("grid1").getModel().getData();

			var index = $.inArray(sKey, $.map(oData, function(n) {
				return n.id;
			}));

			return (index >= 0);

		},
		onExit: function() {

			this.removeFragment(this._formFragments);

		},
	});
});