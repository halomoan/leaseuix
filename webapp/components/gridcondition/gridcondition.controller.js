sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function (Controller) {
	"use strict";

	return Controller.extend("refx.leaseuix.components.gridcondition.gridcondition", {

		onSliderMoved: function (oEvent) {
			var fValue = oEvent.getParameter("value");
			this.byId("gridList").setWidth(fValue + "%");
		}

	});
});