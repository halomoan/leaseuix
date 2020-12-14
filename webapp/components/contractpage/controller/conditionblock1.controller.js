sap.ui.define([
	"refx/leaseuix/controller/BaseController",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"refx/leaseuix/model/formatter"
], function(BaseController,Filter,FilterOperator,formatter) {
	"use strict";

	return BaseController.extend("refx.leaseuix.components.contractpage.controller.conditionblock", {
		
		
		formatter: formatter,
		
		onInit: function() {
			this.oRouter = this.getRouter();
			this.oRouter.getRoute("contractpage").attachPatternMatched(this.__onRouteMatched, this);
			
		},
		
		__onRouteMatched: function(oEvent){
			var oArguments = oEvent.getParameter("arguments");
			this._contract = oArguments.contractId || this._contract || "0";
			
		},
		
		onPeriodChange: function(oEvent){
			var sValue = oEvent.getParameter("value");
		
			this._updatePeriod(sValue);
			
		},
		
		onCashFlow: function(oEvent){
			console.log(this._contract);
			this.oRouter.navTo('cashflow',{contractId: this._contract});
		},
		
		_updatePeriod: function(sPeriod){
			
			var oTable = this.getView().byId("tableCondition1");
			
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
			this.oRouter.detachRouteMatched(this.__onRouteMatched, this);
		}

	});

});