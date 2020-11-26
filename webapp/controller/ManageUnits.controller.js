sap.ui.define([
	"refx/leaseuix/controller/BaseController",
	'sap/ui/model/json/JSONModel',
	'sap/ui/model/Filter',
	'sap/ui/model/FilterOperator',
	"refx/leaseuix/model/formatter"
], function(BaseController, JSONModel, Filter, FilterOperator, formatter) {
	"use strict";

	return BaseController.extend("refx.leaseuix.controller.ManageUnits", {
		formatter: formatter,
		_formFragments: {},
		onInit: function() {

			this.initData();
		},

		initData: function() {
			var oViewData = {

			};
			//this.oRentalUnitsModel = new JSONModel(sap.ui.require.toUrl("refx/leaseuix/mockdata") + "/rentalunitvalues.json");
			
			var oModel = this.getOwnerComponent().getModel();
			this.getView().setModel(oModel);
			
			this.getView().setModel(new JSONModel(oViewData), "viewData");

			this.oGlobalData = this.getModel("globalData");
			this.getView().setModel(this.oGlobalData, "globalData");

			this._initBinding();

		
			
		},
		
		_initBinding : function(){
			
			var oGridList = this.byId("unitGrid");
			
			
			oGridList.addEventDelegate({
				onAfterRendering: function() {
					var oBinding = this.getBinding("items");
					
					oBinding.attachChange(function(oEvent) {
						
						var iTotalSize = 0;
						var sSizeUnit = "";
						
						
						var aItems = oGridList.getItems();
						
						for(var i = 0 ; i < aItems.length; i++){
							
							var oItem = aItems[i].getBindingContext().getObject();
							iTotalSize += parseInt(oItem.Size,0);
							sSizeUnit = oItem.SizeUnit;
						}
						var oSizeText = sap.ui.getCore().byId("__xmlview1--selectunit--Size");
						oSizeText.setText(formatter.NumberFormat(iTotalSize));
						var oSizeUnitText = sap.ui.getCore().byId("__xmlview1--selectunit--SizeUnit");
						oSizeUnitText.setText(sSizeUnit);
					});
				}
			}, oGridList);
			
			var oUnitGridBindingInfo = oGridList.getBindingInfo("items");
				
				
				if (!oUnitGridBindingInfo.parameters) {
					oUnitGridBindingInfo.parameters = {};
				}
				if (!oUnitGridBindingInfo.parameters.custom) {
					oUnitGridBindingInfo.parameters.custom = {};
				}

				oUnitGridBindingInfo.parameters.custom.at = formatter.yyyyMMdd(new Date());
				
				var oFilter1 = new Filter("CompanyCode", FilterOperator.EQ, "1002");
				oUnitGridBindingInfo.filters = [oFilter1];
				oGridList.bindItems(oUnitGridBindingInfo);
		},

		onUnitDetail: function(oEvent) {

			var oSource = oEvent.getSource();

			var oCtx = oEvent.getSource().getBindingContext();

			this.showPopOverFragment(this.getView(), oSource, this._formFragments, "refx.leaseuix.fragments.popunitdetail");

			var oPopOver = sap.ui.core.Fragment.byId(this.getView().getId(), "unitmaster");
			oPopOver.bindElement(oCtx.getPath());

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

		onExit: function() {
			this.removeFragment(this._formFragments);
			console.log("exit");
		}

	});

});