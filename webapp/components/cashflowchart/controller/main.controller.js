sap.ui.define([
	"refx/leaseuix/controller/BaseController",
	'sap/viz/ui5/format/ChartFormatter',
	'sap/viz/ui5/api/env/Format'
], function(BaseController,ChartFormatter,Format) {
	"use strict";

	return BaseController.extend("refx.leaseuix.components.cashflowchart.controller.main", {
	
		oVizFrame : null,
		settingsModel : {
            dataset : {
                name: "Dataset",
                defaultSelected : 1,
                values : [{
                    name : "Small",
                    value : "/small.json"
                },{
                    name : "Medium",
                    value : "/medium.json"
                },{
                    name : "Large",
                    value : "/large.json"
                }]
            },
            series : {
                name : "Series",
                defaultSelected : 0,
                values : [{
                    name : "1 Series",
                    value : ["Revenue"]
                }, {
                    name : '2 Series',
                    value : ["Revenue", "Cost"]
                }]
            },
            dataLabel : {
                name : "Value Label",
                defaultState : true
            },
            axisTitle : {
                name : "Axis Title",
                defaultState : false
            }
        },

		onInit: function() {
			this.oRouter = this.getRouter();
			this.oRouter.getRoute("cashflow").attachPatternMatched(this.__onRouteMatched, this);
			this._configureVizFrame();
	    			
		},
		
		_configureVizFrame: function(){
			Format.numericFormatter(ChartFormatter.getInstance());
            var formatPattern = ChartFormatter.DefaultPattern;
            
			var oVizFrame = this.oVizFrame = this.getView().byId("idVizFrame");
            oVizFrame.setVizProperties({
                plotArea: {
                    dataLabel: {
                        formatString: formatPattern.SHORTFLOAT_MFD2,
                        visible: true
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
                        visible: false
                    }
                },
                title: {
                    visible: false,
                    text: 'Revenue by City and Store Name'
                }
            });
		},

		__onRouteMatched : function(oEvent){
			var oArguments = oEvent.getParameter("arguments");
			this._contract = oArguments.contractId || this._contract || "0";
			
			this.getView().bindElement({
				path: "/ContractSet('" + this._contract + "')"
			});
			
			var	oFilter = new sap.ui.model.Filter("ConditionType",sap.ui.model.FilterOperator.EQ,"L101");

			this.getView().byId("idVizFrame").getDataset().getBinding("data").filter([oFilter]);

		},
		onExit: function() {
			this.oRouter.detachRouteMatched(this.__onRouteMatched, this);
		}

	});

});