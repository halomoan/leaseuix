sap.ui.define([
	"sap/ui/core/mvc/Controller",
	'sap/ui/model/json/JSONModel',
	"sap/ui/core/Fragment",
	"sap/m/MessageBox",
	"refx/leaseuix/model/formatter"
], function (Controller,JSONModel,Fragment,MessageBox,formatter) {
	"use strict";
	
	return Controller.extend("refx.leaseuix.components.gridcondition.gridcondition", {
		formatter: formatter,
		onInit: function () {
			this.initData();
		},
		initData: function () {

			this.oConditionValuesModel = new JSONModel(sap.ui.require.toUrl("refx/leaseuix/mockdata") + "/condformvalues.json");
			this.oConditionModel = new JSONModel(sap.ui.require.toUrl("refx/leaseuix/mockdata") + "/conditions.json");
			this.byId("grid1").setModel(this.oConditionModel);
			this.oFormDataModel =  new JSONModel({"formdata" : {},"formheader" : {} });
			this.getView().setModel(this.oFormDataModel);
			this.getView().setModel(this.oConditionValuesModel,"condformvalues");
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
		
		onEdit: function(oEvent){
			var sPath = oEvent.getSource().getBindingContext().getPath();
			var oModel = oEvent.getSource().getModel();
			
			var oData = oModel.getProperty(sPath);
			
			var idx = sPath.indexOf("/",1);
			var sPathHeader = sPath.substring(0,idx);
			var oHeader = this.byId("grid1").getModel().getProperty(sPathHeader);
			
			
			
			this.getView().getModel().setProperty("/formheader",oHeader);
			this.getView().getModel().setProperty("/formdata",oData);
			
			
			this.openConditionForm();
			
		},
		onDelete: function(oEvent) {
			
			var sPath = oEvent.getSource().getBindingContext().getPath();
						var idx = sPath.split('/')[3];
						var oModel = oEvent.getSource().getModel(); 
						var oData = oModel.getData();
						
			var sText = "Are you sure to delete ?";
			
			MessageBox.confirm(sText, {
			    title : "Confirmation",
			    initialFocus : MessageBox.Action.CANCEL,
			    onClose : function(sButton) {
			        if (sButton === MessageBox.Action.OK) {
						oData[0].cond.splice(idx,1);
						oModel.refresh();
			        } 
			        // else if (sButton === MessageBox.Action.CANCEL) {
			        //     console.log('A');
			        // } else if (sButton === "Custom Button") {
			        //   console.log('B');
			        // }
			    }
			});
		},
		
		openConditionForm: function () {
			var oView = this.getView();
			
		
			if (!this.byId("conditionDialog")) {
		
			 Fragment.load({
			  id: oView.getId(),
			  name: "refx.leaseuix.components.gridcondition.conditiondialog",
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
	        this.byId("conditionDialog").close();
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

		_isCardExist: function(sKey) {
				var oData = this.byId("grid1").getModel().getData();
				
				var index = $.inArray(sKey, $.map(oData, function(n){
				    return n.id;
				}));
				
				return (index >= 0);
				
		},
	});
});