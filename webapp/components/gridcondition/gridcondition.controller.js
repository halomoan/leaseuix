sap.ui.define([
	"sap/ui/core/mvc/Controller",
	'sap/ui/model/json/JSONModel',
	"sap/ui/core/Fragment",
	"refx/leaseuix/model/formatter"
], function (Controller,JSONModel,Fragment,formatter) {
	"use strict";
	
	return Controller.extend("refx.leaseuix.components.gridcondition.gridcondition", {
		formatter: formatter,
		onInit: function () {
			this.initData();
		},
		initData: function () {

			this.oConditionModel = new JSONModel(sap.ui.require.toUrl("refx/leaseuix/mockdata") + "/conditions.json");
			this.byId("grid1").setModel(this.oConditionModel);
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
			this.onOpenDialog();
			
		},
		onDelete: function(id) {
			
		},
		
		
		onOpenDialog: function () {
			var oView = this.getView();
		
		
			if (!this.byId("conditionDialog")) {
		
			 Fragment.load({
			  id: oView.getId(),
			  name: "refx.leaseuix.components.gridcondition.conditionform",
			  controller: this
			}).then(function (oDialog) {
			    oView.addDependent(oDialog);
			    oDialog.open();
			   });
			 } else {
			     this.byId("conditionDialog").open();
	    	}
    	},
 
	    closeDialog: function () {
	        this.byId("openDialog").close();
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