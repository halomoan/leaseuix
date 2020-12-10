sap.ui.define([
	'refx/leaseuix/controller/BaseController',
	'sap/ui/model/json/JSONModel',
	"refx/leaseuix/model/formatter"
], function(BaseController, JSONModel, formatter) {
	"use strict";

	return BaseController.extend("refx.leaseuix.components.contractlst.controller.unitsblock", {
		formatter: formatter,
		
		onInit: function() {
			this.initData();	
		
		},
		
		initData: function(){
			var oViewData = {
				"TotalUnits": 0,
				"TotalSize" : 0,
				"SizeUnit": ""
			};	
			
			this.getView().setModel(new JSONModel(oViewData),"viewData");
		},
		
		onUpdateFinish: function(oEvent){
			var aData = oEvent.getParameter("data").results;
			this._updateTotals(aData);
		},
		
		_updateTotals: function(aData){
			var oViewModel = this.getView().getModel('viewData');
			var iTotalUnits = 0;
			var iTotalSize = 0;
			var sSizeUnit = "";
			for(var i=0;i < aData.length; i++){
				iTotalUnits += 1;
				iTotalSize += parseInt(aData[i].UnitSize,0);
				sSizeUnit = aData[i].SizeUnit;
			}
			
			oViewModel.setProperty("/TotalUnits",iTotalUnits);
			oViewModel.setProperty("/TotalSize",iTotalSize);
			oViewModel.setProperty("/SizeUnit",sSizeUnit);
		}
	});
});