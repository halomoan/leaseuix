sap.ui.define([
	"sap/ui/core/mvc/Controller",
	'sap/ui/model/json/JSONModel'
], function (Controller,JSONModel) {
	"use strict";

	return Controller.extend("refx.leaseuix.components.gridcondition.gridcondition", {

		onInit: function () {
			this.initData();
		},
		initData: function () {

			this.byId("grid1").setModel(new JSONModel([
				{ id: "L101", title: "Base Rent 4x2", subtitle:'Condition: L101', rows: 4, columns: 2 },
				{ id: "L102", title: "Service Charge 2x3", subtitle:'Condition: L102', rows: 2, columns: 3 },
			
			]));
		},
		
		addCard: function(){
			var oData = this.byId("grid1").getModel().getData();
			var oCondition = { id: "L103", title: "A&P Charge 2x2", subtitle:'Condition: L103', rows: 2, columns: 2 };
			
			if (!this._isCardExist(oCondition.id)) {
				oData.push(	oCondition);
				this.byId("grid1").getModel().setProperty("/",oData);
			}
		},
		findID: function(){
			var oView = this.getView();
			console.log(oView.byId("grid1"));	
		},
		
		_isCardExist: function(sKey) {
				var oData = this.byId("grid1").getModel().getData();
				
				var index = $.inArray(sKey, $.map(oData, function(n){
				    return n.id;
				}));
				
				return (index >= 0);
				
		},
	});
});