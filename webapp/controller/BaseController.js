sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/routing/History",
	"sap/ui/core/UIComponent"
], function(Controller, History, UIComponent) {
	"use strict";

	return Controller.extend("sap.ui.demo.nav.controller.BaseController", {

		getRouter : function () {
			return UIComponent.getRouterFor(this);
		},

		onNavBack: function () {
			var oHistory, sPreviousHash;

			oHistory = History.getInstance();
			sPreviousHash = oHistory.getPreviousHash();

			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
				this.getRouter().navTo("appHome", {}, true /*no history*/);
			}
		},
		getFormFragment: function (oView, _formFragments, sFragmentName) {
			var oFormFragment = _formFragments[sFragmentName];
		
			if (oFormFragment) {
				
				return oFormFragment;
			}
		
			oFormFragment = sap.ui.xmlfragment(oView.getId(), "refx.leaseuix.components.gridcondition." + sFragmentName,this);
			oView.addDependent(oFormFragment);
			
			var myFragment = (_formFragments[sFragmentName] = oFormFragment);
			return myFragment;
		},

		showFormDialogFragment : function (oView, _formFragments,sFragmentName) {
			this.getFormFragment(oView, _formFragments,sFragmentName).open();
		},
		
		showFormFragment : function (sFragmentName) {
			var oPage = this.getView().byId("page");
		
			oPage.removeAllContent();
			oPage.insertContent(this.getFormFragment(sFragmentName));
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