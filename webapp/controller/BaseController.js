sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/routing/History",
	"sap/ui/core/UIComponent",
	"sap/ui/model/json/JSONModel"
], function(Controller, History, UIComponent,JSONModel) {
	"use strict";

	return Controller.extend("sap.ui.demo.nav.controller.BaseController", {

		getRouter : function () {
			return UIComponent.getRouterFor(this);
		},
		
		getModel: function(sModelName){
			var oModel = this.getOwnerComponent().getModel(sModelName);
			
			if (!oModel) {
				this.getOwnerComponent().createModel(sModelName);
				return this.getOwnerComponent().getModel(sModelName);	
			} else {
				return oModel;
			}
			
		},
		
		
		onNavBack: function () {
			var oHistory, sPreviousHash;

			oHistory = History.getInstance();
			sPreviousHash = oHistory.getPreviousHash();

			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
				this.getRouter().navTo("businessentity", {}, true /*no history*/);
			}
		},
		getFormFragment: function (oView, _formFragments, sFragmentName,oThis) {
			var oFormFragment = _formFragments[sFragmentName];
		
			if (oFormFragment) {
				
				return oFormFragment;
			}
		
			//oFormFragment = sap.ui.xmlfragment(oView.getId(), "refx.leaseuix.components.gridcondition." + sFragmentName,this);
			oFormFragment = sap.ui.xmlfragment(oView.getId(), sFragmentName,oThis);
			oView.addDependent(oFormFragment);
			
			var myFragment = (_formFragments[sFragmentName] = oFormFragment);
			return myFragment;
		},
		
		showPopOverFragment : function(oView,oSource, _formFragments,sFragmentName,oThis) {
			this.getFormFragment(oView, _formFragments,sFragmentName,oThis).openBy(oSource);
		},

		showFormDialogFragment : function (oView, _formFragments,sFragmentName,oThis) {
			this.getFormFragment(oView, _formFragments,sFragmentName,oThis).open();
		},
		
		showFormFragment : function (oView,containerId,_formFragments,sFragmentName,bClearMode) {
			var oContainer = this.getView().byId(containerId);
			
			
			if (bClearMode){
				if (oContainer instanceof sap.f.GridContainer ){
					
					oContainer.removeAllItems();
				} else {
					oContainer.removeAllContent();
				}
			}
			
			if (oContainer instanceof sap.f.GridContainer ){
				oContainer.addItem(this.getFormFragment(oView,_formFragments,sFragmentName));
			} else {
				oContainer.insertContent(this.getFormFragment(oView,_formFragments,sFragmentName));
			}
			
			
		},
		removeFragment: function(_formFragments){
			for(var sPropertyName in _formFragments) {
				if(!_formFragments.hasOwnProperty(sPropertyName)) {
					return;
				}
	
				_formFragments[sPropertyName].destroy();
				_formFragments[sPropertyName] = null;
			}
		}

	});

});