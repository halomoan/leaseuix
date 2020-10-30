sap.ui.define([
	"sap/ui/core/mvc/Controller",
	'sap/ui/model/json/JSONModel',
	"refx/leaseuix/model/formatter"
], function (Controller,JSONModel,formatter) {
	"use strict";
	
	return Controller.extend("refx.leaseuix.components.gridcondition.gridcondition", {
		formatter: formatter,
		onInit: function () {
			this.initData();
		},
		initData: function () {

			this.byId("grid1").setModel(new JSONModel([
				{ id: "L101", title: "Base Rent", rows: 4, columns: 5, cond: 
					[ 
						{ id: '1', type:'L101', condpurposeid: 'XX', condpurpose: 'Actual Rent', formulaid: 'XX', formula:'Resid./Usable Space in SF', salesruleid: '20', salesrule: '10%', freq: '1', frequnit:'Monthly', highlight:'Warning' , expired: false, fromDate: '2020-01-01',toDate: '2020-10-30','amount': 5.8,'curr': 'SGD', new: true},
						{ id: '1', type:'L101', condpurposeid: 'XX', condpurpose: 'Actual Rent', formulaid: 'XX', formula:'Resid./Usable Space in SF', salesruleid: '20', salesrule: '10%', freq: '1', frequnit:'Monthly', highlight:'Success' , expired: true, fromDate: '2020-01-01',toDate: '2020-10-30','amount': 5.8,'curr': 'SGD', new: false},
						{ id: '1', type:'L101', condpurposeid: 'XX', condpurpose: 'Actual Rent', formulaid: 'XX', formula:'Resid./Usable Space in SF', salesruleid: '20', salesrule: '10%', freq: '1', frequnit:'Monthly', highlight:'Error' , expired: true, fromDate: '2020-01-01',toDate: '2020-10-30','amount': 5.8,'curr': 'SGD', new: false},
						
					] },
				{ id: "L102", title: "Service Charge 2x3", subtitle:'Condition: L102', rows: 3, columns: 3, cond: [ { id: '1', name: 'Rudy'}] },
			
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
			var oData = oView.byId("grid1").getModel();
			
			console.log(oData);
		
		},
		
		onEdit: function(id){
			console.log(id);	
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