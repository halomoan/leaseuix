sap.ui.define([
	"sap/ui/core/mvc/Controller",
	'sap/ui/model/json/JSONModel',
	"sap/ui/core/Fragment",
	"sap/m/MessageBox",
	"sap/ui/core/dnd/DragInfo",
	"sap/ui/core/dnd/DropInfo",
	"sap/ui/core/dnd/DropPosition",
	"sap/ui/core/dnd/DropLayout",
	"sap/f/dnd/GridDropInfo",
	"refx/leaseuix/model/formatter"
], function (Controller,JSONModel,Fragment,MessageBox,DragInfo,DropInfo,DropPosition,DropLayout,GridDropInfo,formatter) {
	"use strict";
	
	return Controller.extend("refx.leaseuix.components.gridcondition.gridcondition", {
		formatter: formatter,
		onInit: function () {
			this.initData();
			this._attachDragAndDrop();
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
			//var oData = this.byId("grid1").getModel().getData();
			
			var oCondition = { 
					"id": "L102",
					"title": "Service Charge Rent",
					"rows": 4,
					"columns": 5,
					"cond": []
				
			};
			
			
			if (!this._isCardExist(oCondition.id)) {
				var oData = this.byId("grid1").getModel().getData();
				oData.push(	oCondition);
				this.byId("grid1").getModel().setProperty("/",oData);
			}else{
				
			}
		},
		findID: function(){
			var oView = this.getView();
			var oData = oView.byId("grid1").getModel();
			
			console.log(oData);
		
		},
		onDelete: function(oEvent){
			var sPath = oEvent.getSource().getBindingContext().getPath();
			var oModel = oEvent.getSource().getModel();
			var oData = oModel.getData();
			var idx = sPath.split('/')[1];
			
			var oViewModel = this.getView().getModel("condformvalues");
			
			
			var sText = "Are you sure to remove this condition ?";
			
			MessageBox.confirm(sText, {
			    title : "Confirmation",
			    initialFocus : MessageBox.Action.CANCEL,
			    onClose : function(sButton) {
			        if (sButton === MessageBox.Action.OK) {
			        	
						var oItem = oData.splice(idx,1);
						console.log(oItem[0]);
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
		onItemEdit: function(oEvent){
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
		onItemAdd: function(oEvent) {
			
			var oVModel = this.getView().getModel("condformvalues");
			var oNewItem = {...oVModel.getData().conditem};
			
			var sPath = oEvent.getSource().getBindingContext().getPath();
			var oModel = oEvent.getSource().getModel();
			var oHeader = oModel.getProperty(sPath);
			
			
			
			var iIndex  = oHeader.cond.length - 1;
		
			if (iIndex >= 0) {
				switch(oHeader.cond[iIndex].highlight){
					case "Success":
						oNewItem.highlight = "Error";
						break;
					case "Error": 
						oNewItem.highlight = "Warning";
						break;
					case "Warning": 
						oNewItem.highlight = "Success";
						break;	
				};
				oNewItem.id = oHeader.cond[iIndex].id + 1;
				oNewItem.curr = oHeader.cond[iIndex].curr;
			} else {
				oNewItem.highlight = "Error";
				oNewItem.curr = oVModel.getData().currency;
				
			}
	
			oHeader.cond.push(oNewItem);	
			
			this.getView().getModel().setProperty("/formheader",oHeader);
			this.getView().getModel().setProperty("/formdata",oHeader.cond[iIndex + 1]);
			
			this.openConditionForm();
			
		},
		onItemDelete: function(oEvent) {
			
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
	    	this.byId("grid1").getModel().refresh();
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
	   
	   _attachDragAndDrop: function () {
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
		
		_onDropIndicatorSize: function (oDraggedControl) {
			console.log(oDraggedControl);
				

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
		_onDrop: function (oInfo) {
			var oDragged = oInfo.getParameter("draggedControl"),
				oDropped = oInfo.getParameter("droppedControl"),
				sInsertPosition = oInfo.getParameter("dropPosition"),

				oDragContainer = oDragged.getParent(),
				oDropContainer = oInfo.getSource().getParent();

			if (oDragged.isA("sap.m.StandardListItem")){
				var oDragModel = oDragContainer.getModel("condformvalues"),
				oDropModel = oDropContainer.getModel(),
				oDragModelData = oDragModel.getData().condlist,
				oDropModelData = oDropModel.getData();

				
			
			} else {
				var oDragModel = oDragContainer.getModel(),
				oDropModel = oDropContainer.getModel("condformvalues"),
				oDragModelData = oDragModel.getData(),
				oDropModelData = oDropModel.getData().condlist;

				
			}	
			var iDragPosition = oDragContainer.indexOfItem(oDragged),
				iDropPosition = oDropContainer.indexOfItem(oDropped);
				//console.log(oDragModel);
				

			// remove the item
			var oItem = oDragModelData[iDragPosition];
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
				if (oDragged.isA("sap.m.StandardListItem")){
					oDragModel.setData(oDragModelData,"condformvalues");
					oDropModel.setData(oDropModelData);
				} else{
					oDragModel.setData(oDragModelData,"");
					oDropModel.setData(oDropModelData,"condformvalues");
				}
			} else {
				oDropModel.setData(oDropModelData);
			}

			this.byId("grid1").focusItem(iDropPosition);
		},

		_isCardExist: function(sKey) {
				var oData = this.byId("grid1").getModel().getData();
				
				var index = $.inArray(sKey, $.map(oData, function(n){
				    return n.id;
				}));
				
				// if (index >=0){
				// 	return oData[index];
				// } else {
				// 	return false;
				// }
				
				return (index >= 0);
				
		},
	});
});