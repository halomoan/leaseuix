sap.ui.define([
	'sap/ui/core/mvc/Controller',
	'sap/ui/model/json/JSONModel',
	'sap/m/ColumnListItem',
	'sap/m/Label',
	'sap/m/Token'
], function (Controller, JSONModel, ColumnListItem, Label, Token) {
	"use strict";

	return Controller.extend("refx.leaseuix.components.selectcustomer.selectcustomer", {
		onInit: function () {
			this._oInput = this.getView().byId("customer");
			//this._oInput.setSelectedKey("HT-1001");

			this.oColModel = new JSONModel(sap.ui.require.toUrl("refx/leaseuix/components/selectcustomer") + "/columns.json");
			this.oCustomersModel = new JSONModel(sap.ui.require.toUrl("refx/leaseuix/mockdata") + "/customers.json");
			this.getView().setModel(this.oCustomersModel);
		},

		onValueHelpRequested: function() {
			var aCols = this.oColModel.getData().cols;

			this._oValueHelpDialog = sap.ui.xmlfragment("refx.leaseuix.components.selectcustomer.selectcustomer", this);
			this.getView().addDependent(this._oValueHelpDialog);

			this._oValueHelpDialog.getTableAsync().then(function (oTable) {
				oTable.setModel(this.oCustomersModel);
				oTable.setModel(this.oColModel, "columns");

				if (oTable.bindRows) {
					oTable.bindAggregation("rows", "/Customers");
				}

				if (oTable.bindItems) {
					oTable.bindAggregation("items", "/Customers", function () {
						return new ColumnListItem({
							cells: aCols.map(function (column) {
								return new Label({ text: "{" + column.template + "}" });
							})
						});
					});
				}

				this._oValueHelpDialog.update();
			}.bind(this));

			var oToken = new Token();
			oToken.setKey(this._oInput.getSelectedKey());
			oToken.setText(this._oInput.getValue());
			this._oValueHelpDialog.setTokens([oToken]);
			this._oValueHelpDialog.open();
		},

		onValueHelpOkPress: function (oEvent) {
			var aTokens = oEvent.getParameter("tokens");
			this._oInput.setSelectedKey(aTokens[0].getKey());
			this._oValueHelpDialog.close();
		},

		onValueHelpCancelPress: function () {
			this._oValueHelpDialog.close();
		},

		onValueHelpAfterClose: function () {
			this._oValueHelpDialog.destroy();
		}
	});
});