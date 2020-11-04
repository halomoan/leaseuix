sap.ui.define([
	// "sap/ui/core/mvc/Controller",
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
], function (BaseController,JSONModel,Fragment,MessageBox,MessageToast,DragInfo,DropInfo,DropPosition,DropLayout,GridDropInfo,Filter,FilterOperator,formatter) {
	"use strict";
	
	return BaseController.extend("refx.leaseuix.components.gridcondition.gridcondition", {
		formatter: formatter,
		_formFragments: {},
		
		onInit: function () {
			this.initData();
			this._attachDragAndDrop();
		},
		initData: function () {
			var viewData = {
								"stdwzd" : { "showOK": false }, 
								"stgwzd" : { "showError" : false},
								"formdata" : {},"formheader" : {}
							};	
			this.getView().setModel(new JSONModel(viewData));
			
			this.oConditionValuesModel = new JSONModel(sap.ui.require.toUrl("refx/leaseuix/mockdata") + "/condformvalues.json");
			this.oConditionModel = new JSONModel(sap.ui.require.toUrl("refx/leaseuix/mockdata") + "/conditions.json");
			this.byId("grid1").setModel(this.oConditionModel);
			// this.oFormDataModel =  new JSONModel({"formdata" : {},"formheader" : {} });
			// this.getView().setModel(this.oFormDataModel);
			
			
			this.getView().setModel(this.oConditionValuesModel,"condformvalues");
			
			this._DateSort = 1;
		},
		
		// addCard: function(){
		// 	//var oData = this.byId("grid1").getModel().getData();
			
		// 	var oCondition = { 
		// 			"id": "L102",
		// 			"title": "Service Charge Rent",
		// 			"rows": 4,
		// 			"columns": 5,
		// 			"cond": []
				
		// 	};
			
			
		// 	if (!this._isCardExist(oCondition.id)) {
		// 		var oData = this.byId("grid1").getModel().getData();
		// 		oData.push(	oCondition);
		// 		this.byId("grid1").getModel().setProperty("/",oData);
		// 	}else{
				
		// 	}
		// },
		// findID: function(){
		// 	var oView = this.getView();
		// 	var oData = oView.byId("grid1").getModel();
			
		// 	console.log(oData);
		
		// },
		
		onMenuAction: function(oEvent) {
			var oItem = oEvent.getParameter("item"),
						sItemPath = "";

				while (oItem instanceof sap.m.MenuItem) {
					
					var sId = oItem.getId();
					sId = sId.substring(sId.length - 4, sId.length);
					
					console.log(sId);
					switch(sId) {
						case "wzd1" : this.openStdWizardFrom();
							break;
						case "wzd2" : this.openstgWizardForm();
							break;	
					}
					
					oItem = oItem.getParent();
				}

				
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
		
		onSearch: function (oEvent) {
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
			        // .}
			    }
			});
		},
		
		openStdWizardFrom: function() {
			
			this.showFormDialogFragment(this.getView(),this._formFragments,"standardwizard");
			var navCon = this.byId("navStdWzd");
			navCon.to(this.byId("stdForm0"),"show");
		},
		openstgWizardForm: function(){
			
			const max = this.getView().getModel("condformvalues").getProperty("/maxstaggered");
			var aStgItems = [];
			for(var i = 1; i <= max; i++){
				aStgItems.push({"id": i, "text": i});
			}
			
			this.getView().getModel().setProperty("/stgwzd/stgItems",aStgItems);
			
			this.showFormDialogFragment(this.getView(),this._formFragments,"staggeredwizard");
			var navCon = this.byId("navStgWzd");
			navCon.to(this.byId("stdForm0"),"show");
		},
		openConditionForm: function () {
			var oView = this.getView();
			
			this._formDataOri = {...oView.getModel().getProperty("/formdata")};
			this.showFormDialogFragment(this.getView(),this._formFragments,"conditionDialog");
    	},
 
		cancelDialog: function () {
				var oData = this.getView().getModel().getProperty("/formdata");
				
				for(var key in this._formDataOri){
					oData[key] = this._formDataOri[key];
				}
	    		
		    	//this.byId("grid1").getModel().refresh();
		        this.byId("conditionDialog").close();
	    	
	    },
	    onStgWzdNext: function(oEvent){
	    	var navCon = this.byId("navStdWzd");
	    	var target = oEvent.getSource().data("target");
	    	
	    },
	    
	    onStdWzdNext: function(oEvent){
			var navCon = this.byId("navStdWzd");
			var oModel = this.getView().getModel("condformvalues");
			var oData = oModel.getProperty("/stdWizard");
			
			
			var target = oEvent.getSource().data("target");
			if (target) {
				var idx = parseInt(target.charAt(target.length-1));
				
				if (idx === (oData.length - 1)) {
					
					this.getView().getModel().setProperty("/stdwzd/showOK",true);
				} else {
					this.getView().getModel().setProperty("/stdwzd/showOK",false);
				}
				navCon.to(this.byId(target), "slide");
			} else {
				navCon.back();
			}
		},
	    closeStdWizard: function() {
	    	
	    	var oModel = this.getView().getModel("condformvalues");
	    	//var oData = [...oModel.getProperty("/stdWizard")];
	    	
	    	var oData =  oModel.getProperty("/stdWizard").filter(item => !item.dontapply);
	    	
	    	this.byId("grid1").getModel().setProperty("/",oData);
	    	//	this.byId("grid1").getModel().refresh();
	    	
	    	
	    	this.byId("stdWizardDialog").close();
	    },
	    closeStgWizard: function() {
	    	this.byId("stgWizardDialog").close();
	    },
	    cancelStdWizard: function() {
	    	this.byId("stdWizardDialog").close();
	    },
	    
	    cancelStgWizard: function() {
	    	this.byId("stgWizardDialog").close();
	    },
	    
	    closeDialog: function () {
	    	var oStatus = this._validForm();
	    	
	    	if(!oStatus.hasError) {
		    	this.byId("grid1").getModel().refresh();
		        this.byId("conditionDialog").close();
	    	} else{
	    		MessageToast.show(oStatus.msg);
	    	}
	    },
	    
	    validNoStaggered: function(oEvent){
	    	const oControl =  oEvent.getSource();
	    	const val = oControl.getValue();
	    	const max = this.getView().getModel("condformvalues").getProperty("/maxstaggered");
	    	console.log(val);
	    	if ( val < 1 || val > max) {
	    		oControl.setValueState(sap.ui.core.ValueState.Error);
	    		this.getView().getModel().setProperty("/stgwzd/showError",true);
	    	} else {
	    		oControl.setValueState(sap.ui.core.ValueState.None);
	    		this.getView().getModel().setProperty("/stgwzd/showError",false);
	    	}
	    },
	     _validForm: function(){
	   		var oData = this.getView().getModel().getProperty("/formdata");
	   		var fragId = this.getView().getId();
	   		var oStatus = { "hasError" : false, "msg": "" };
	   		
	   		// var oControl = sap.ui.core.Fragment.byId(fragId, "form1");
	   		
	   		// console.log(oControl.getRequireFields());
	   		 var requiredInputs = ['fromDate', 'toDate', 'amount'];
	   		
	   		requiredInputs.forEach(function (control) {
	   			var oControl = sap.ui.core.Fragment.byId(fragId, control);
	   			
	   			var sType = oControl.getBinding("value").getType().getName();
	   			
	   			
	   			if (sType === "Currency"){
	   				if (oControl.getValue() <= 0) {
			   			oControl.setValueState(sap.ui.core.ValueState.Error);
			   			oStatus.hasError = true;
			   		} else {
			   			oControl.setValueState(sap.ui.core.ValueState.None);
			   		}
	   			}else{
		   			if (oControl.getValue() === "") {
			   			oControl.setValueState(sap.ui.core.ValueState.Error);
			   			oStatus.hasError = true;
			   		} else {
			   			oControl.setValueState(sap.ui.core.ValueState.None);
			   		}	
	   			}
	   			
	   		});
	   		
	   		if (oData.fromDate > oData.toDate) {
	   			oStatus.hasError = true;
	   			oStatus.msg = "From Date cannot be later than To Date";
	   			
	   			sap.ui.core.Fragment.byId(fragId, "fromDate").setValueState(sap.ui.core.ValueState.Error);
	   			
	   		} else {
	   			sap.ui.core.Fragment.byId(fragId, "fromDate").setValueState(sap.ui.core.ValueState.None);
	   		}
	   		
	   		var oHeaderData =  this.getView().getModel().getProperty("/formheader");
	   		oHeaderData.cond.forEach(function(cond){
	   			
	   			if (cond.id != oData.id){
	   				
	   				var bOverlap = ( oData.fromDate >= cond.fromDate ) && ( oData.fromDate <= cond.toDate ) || 
	   				 				( cond.fromDate >= oData.fromDate ) && ( cond.fromDate <= oData.toDate );
	   				if (bOverlap) {
	   					oStatus.hasError = true;
	   					oStatus.msg = "Selected Date Range is Overlapping with Existing Condition";
	   					
	   					sap.ui.core.Fragment.byId(fragId, "fromDate").setValueState(sap.ui.core.ValueState.Error);
	   					sap.ui.core.Fragment.byId(fragId, "toDate").setValueState(sap.ui.core.ValueState.Error);
	   				} else{
	   					sap.ui.core.Fragment.byId(fragId, "fromDate").setValueState(sap.ui.core.ValueState.None);
	   					sap.ui.core.Fragment.byId(fragId, "toDate").setValueState(sap.ui.core.ValueState.None);
	   				}
	   			
	   			}
	   		})

	   		return oStatus;
	   		
	   },
	   
	   onDateSort: function(oEvent){
	   			var sPath = oEvent.getSource().getBindingContext().getPath();
	   			var oData = oEvent.getSource().getModel().getProperty(sPath);
	   		
	   			var aData = oData.cond;
	   			
	   			this._DateSort =  -1 * this._DateSort; 
		   		aData.sort((a,b)=>
		   		
		   			( parseInt(a.fromDate) > parseInt(b.fromDate) ) ? 1 * this._DateSort : -1 * this._DateSort 
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

			var oDragModel,oDragModelData,oDropModel,oDropModelData;
			
			
			if (oDragged.isA("sap.m.StandardListItem")){
				oDragModel = oDragContainer.getModel("condformvalues");
				oDragModelData = oDragModel.getData().condlist;
				
			} else {	
				oDragModel = oDragContainer.getModel();
				oDragModelData = oDragModel.getData();
				
			}
			
			if (oDropped && oDropped.isA("sap.m.StandardListItem")){
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
			
			
			if (oDragModel !== oDropModel && this._isCardExist(oItem.id)){
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
				if (oDragged.isA("sap.m.StandardListItem")){
					
				
					oDragModel.setData(oDragModelData,"condformvalues");
					oDropModel.setData(oDropModelData);	
					
					
				} else{
					oDragModel.setData(oDragModelData,"");
					oDropModel.setData(oDropModelData,"condformvalues");
				}
			} else {
				if (oDropped && oDropped.isA("sap.m.StandardListItem")){
					oDropModel.setData(oDropModelData,"condformvalues");
				} else{
					oDropModel.setData(oDropModelData);
				}
			}

			this.byId("grid1").focusItem(iDropPosition);
		},

		_isCardExist: function(sKey) {
				var oData = this.byId("grid1").getModel().getData();
				
				var index = $.inArray(sKey, $.map(oData, function(n){
				    return n.id;
				}));
				
				return (index >= 0);
				
		},
		onExit : function () {
			
			this.removeFragment(this._formFragments);
			
		},
	});
});