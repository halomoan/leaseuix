sap.ui.define([
	"refx/leaseuix/controller/BaseController",
	'sap/viz/ui5/format/ChartFormatter',
	'sap/viz/ui5/api/env/Format',
	'sap/ui/model/BindingMode',
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	'sap/ui/model/json/JSONModel',
	"refx/leaseuix/model/formatter",
	'./InitPage'
], function(BaseController, ChartFormatter, Format, BindingMode, Filter, FilterOperator, 
		JSONModel, formatter, InitPageUtil) {
	"use strict";

	return BaseController.extend("refx.leaseuix.components.cashflowchart.controller.main", {

		onInit: function() {

			this.oRouter = this.getRouter();
			this.oRouter.getRoute("cashflow").attachPatternMatched(this.__onRouteMatched, this);

			Format.numericFormatter(ChartFormatter.getInstance());
			var formatPattern = ChartFormatter.DefaultPattern;

			var oVizFrame = this.getView().byId("idVizFrame");

			oVizFrame.setVizProperties({
				plotArea: {
					dataLabel: {
						formatString: formatPattern.SHORTFLOAT_MFD2,
						visible: true,
						showTotal: true
					}
				},
				valueAxis: {
					label: {
						formatString: formatPattern.SHORTFLOAT
					},
					title: {
						visible: false
					}
				},
				categoryAxis: {
					title: {
						visible: true
					}
				},
				title: {
					visible: true,
					text: 'Cash Flow by Periods'
				}
			});

			var oPopOver = this.getView().byId("idPopOver");
			oPopOver.connect(oVizFrame.getVizUid());
			oPopOver.setFormatString(formatPattern.STANDARDFLOAT);

			InitPageUtil.initPageSettings(this.getView());

		},

		__onRouteMatched: function(oEvent) {
			var oArguments = oEvent.getParameter("arguments");
			this._contract = oArguments.contractId || this._contract || "0";
			var stype = oArguments.type;
			var sPeriod = oArguments.period;
			var sDate = formatter.ODataDate(new Date());   

			this.getView().bindElement({
				path: "/ContractSet('" + this._contract + "')"
			});

			this.getView().getModel().attachRequestSent(function() {
				sap.ui.core.BusyIndicator.show(0);
			});
			this.getView().getModel().attachRequestCompleted(function() {
				sap.ui.core.BusyIndicator.hide();
			});

			var oFilterCond = null;
			var oFilterSDate = null;
			var oFilterEDate = null;
			var aSorter = null;
			var aFilters = [];

			if (stype === "SL") {
				oFilterCond = new Filter("ConditionType", sap.ui.model.FilterOperator.BT, 'L160', 'L199');
				aSorter = [
					new sap.ui.model.Sorter({
						path: "DueDate",
						descending: false,
						group: false
					}),
					new sap.ui.model.Sorter({
						path: "ConditionType",
						descending: true,
						group: false
					})
				];
			} else {
				aSorter = [
					new sap.ui.model.Sorter({
						path: "DueDate",
						descending: false,
						group: false
					}),
					new sap.ui.model.Sorter({
						path: "ConditionType",
						descending: false,
						group: false
					})
				];
				oFilterCond = new Filter("ConditionType", sap.ui.model.FilterOperator.BT, 'L101', 'L110');
			}

			aFilters.push(oFilterCond);

			if (sPeriod === 'Current'){
				oFilterSDate = new Filter('validfrom', FilterOperator.LE, sDate);
				oFilterEDate = new Filter('validto', FilterOperator.GE, sDate);
			} else if (sPeriod === 'Future'){
				oFilterSDate = new Filter('validfrom', FilterOperator.GT, sDate);
			} else if (sPeriod === 'Past'){
				oFilterEDate = new Filter('validto', FilterOperator.LT, sDate);
			} 
			
			if (oFilterSDate) {
				aFilters.push(oFilterSDate);
			}
			
			if (oFilterEDate) {
				aFilters.push(oFilterEDate);
			}
						
			this.getView().byId("idVizFrame").getDataset().getBinding("data").filter(aFilters);
			this.getView().byId("idVizFrame").getDataset().getBinding("data").sort(aSorter);
		},

		onExit: function() {
			this.oRouter.detachRouteMatched(this.__onRouteMatched, this);
		}

	});

});