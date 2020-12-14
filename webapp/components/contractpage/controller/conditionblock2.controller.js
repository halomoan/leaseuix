sap.ui.define([
"sap/ui/core/mvc/Controller",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"refx/leaseuix/model/formatter"
], function(Controller,Filter,FilterOperator,formatter) {
	"use strict";

	return Controller.extend("refx.leaseuix.components.contractpage.controller.conditionblock2", {

		formatter: formatter,
		onInit: function() {
			
		},
		
		onPeriodChange: function(oEvent){
			var sValue = oEvent.getParameter("value");
		
			this._updatePeriod(sValue);
			
		},
		
		_updatePeriod: function(sPeriod){
			
			var oTable = this.getView().byId("tableCondition2");
			
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