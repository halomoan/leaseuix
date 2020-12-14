sap.ui.define([
	"refx/leaseuix/controller/BaseController",
	'sap/viz/ui5/format/ChartFormatter',
	'sap/viz/ui5/api/env/Format',
	'sap/ui/model/BindingMode',
    'sap/ui/model/json/JSONModel',
    './InitPage'
], function(BaseController,ChartFormatter,Format,BindingMode,JSONModel,InitPageUtil) {
	"use strict";

	return BaseController.extend("refx.leaseuix.components.cashflowchart.controller.main", {
	
	 dataPath : "test-resources/sap/viz/demokit/dataset/milk_production_testing_data/revenue_cost_consume",

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
                    value : ["Amount"]
                }, {
                    name : '2 Series',
                    value : ["Amount", "Amount"]
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

        oVizFrame : null,

        onInit : function () {
        	
            this.oRouter = this.getRouter();
			this.oRouter.getRoute("cashflow").attachPatternMatched(this.__onRouteMatched, this);
			
            Format.numericFormatter(ChartFormatter.getInstance());
            var formatPattern = ChartFormatter.DefaultPattern;
            var oModel = new JSONModel(this.settingsModel);
            oModel.setDefaultBindingMode(BindingMode.OneWay);
            this.getView().setModel(oModel);

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
          
            var oPopOver = this.getView().byId("idPopOver");
            oPopOver.connect(oVizFrame.getVizUid());
            oPopOver.setFormatString(formatPattern.STANDARDFLOAT);

            InitPageUtil.initPageSettings(this.getView());
          
            
        },
        
        __onRouteMatched: function(oEvent)  {
        	 var oArguments = oEvent.getParameter("arguments");
			 this._contract = oArguments.contractId || this._contract || "0";
			
			// var oModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/sap/ContractSet('" + this._contract + "')");
			// this.getView().setModel(oModel);
			
			console.log(this._contract);
        	this.getView().bindElement({
				path: "/ContractSet('" + this._contract + "')"
			});
        },
		onExit: function() {
			this.oRouter.detachRouteMatched(this.__onRouteMatched, this);
		}

	});

});