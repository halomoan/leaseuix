sap.ui.define([
	"refx/leaseuix/controller/BaseController",
	'sap/ui/model/json/JSONModel',
	"refx/leaseuix/model/formatter"
], function(BaseController, JSONModel, formatter) {
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
			this.oRentalUnitsModel = new JSONModel(sap.ui.require.toUrl("refx/leaseuix/mockdata") + "/rentalunitvalues.json");
			this.getView().setModel(this.oRentalUnitsModel);
			this.getView().setModel(new JSONModel(oViewData), "viewData");

			this.oGlobalData = this.getModel("globalData");
			this.getView().setModel(this.oGlobalData, "globalData");
			
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

			console.log(oDragged,oDropped);
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
		onExit: function() {

		}

	});

});