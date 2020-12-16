sap.ui.define([
	"refx/leaseuix/controller/BaseController",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"refx/leaseuix/model/formatter"
], function(BaseController,Filter,FilterOperator,formatter) {
	"use strict";

	return BaseController.extend("refx.leaseuix.components.contractpage.controller.conditionblock3", {

		formatter: formatter,
		onInit: function() {
			this._showPeriod = 'All';
		},
		
		onPeriodChange: function(oEvent){
			var sValue = oEvent.getParameter("value");
			this._showPeriod = sValue;
			
			this._updatePeriod(sValue);
			
		},
		
		onCashFlow: function(oEvent){
			
			var oGlobalModel = this.getModel("globalData");
			var sContractId = oGlobalModel.getProperty("/ContractId");
			
			this.getRouter().navTo('cashflow',{contractId: sContractId, type: "SL",period: 'All'});
		},
		
		_updatePeriod: function(sPeriod){
			
			var oTable = this.getView().byId("tableCondition3");
			
			var sDate = formatter.ODataDate(new Date());                         
			var oBinding = oTable.getBinding("items");
		
			var aFilters = [];
			var oFilterSDate = null;
			var oFilterEDate = null;
			
			
			if (sPeriod === 'Current'){
				oFilterSDate = new Filter('validfrom', FilterOperator.LE, sDate);
    			oFilterEDate = new Filter('validto', FilterOperator.GE, sDate);
			} else if (sPeriod === 'Future'){
				oFilterSDate = new Filter('validfrom', FilterOperator.GT, sDate);
			} else if (sPeriod === 'Past'){
    			oFilterEDate = new Filter('validto', FilterOperator.LT, sDate);
			} 
			
			if (oFilterSDate){
				aFilters.push(oFilterSDate);
			}
			if (oFilterEDate){
				aFilters.push(oFilterEDate);
			}
			oBinding.filter(aFilters);
		},
		
		onExit: function() {
		
		}

	});

});