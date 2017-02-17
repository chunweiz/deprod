sap.ui.define([
	"jquery.sap.global",
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/odata/v2/ODataModel",
    "wb/cosmos/dealapp/util/Formatter",
    "wb/cosmos/dealapp/control/p13n/P13nDialogController",
    "sap/ui/table/Column",
    "sap/ui/table/SortOrder",
    "sap/ui/model/Sorter",
    "sap/m/MessageBox",
    "sap/m/Toolbar",
    "sap/m/ToolbarSpacer",
    "sap/m/Button",
    "sap/m/Label",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/Sorter"

], function($, Controller, JSONModel, ODataModel, Column, Toolbar, ToolbarSpacer, Button, Label, Filter, FilterOperator, Sorter, SortOrder,P13nDialogController) {
	"use strict";
   
    var CustomController = Controller.extend("wb.cosmos.dealapp.controller.Dimension");
 
    CustomController.prototype.onInit = function () {

        this._oTable = this.getView().byId("wb-Dimension");
        this._oMetadata = null;
        this._oSearchHelpMetadata = null;
        this._oP13nDialog = null;
        
       
        // Startup functions
       // this._subscribeEvents();
        this._initTableP13nDialog();
        this._initMetadataModel();
        this._initTable();
        this._initSearchHelpModel();
        this._initViewModel();
        
       
    };
    
    CustomController.prototype._initMetadataModel = function () {
    
        this._oMetadata = this.getOwnerComponent().getModel("dealInfo");
        this._oMetadata.setDefaultCountMode(sap.ui.model.odata.CountMode.Request);
        this._oSearchHelpMetadata = this.getOwnerComponent().getModel("dealSearchHelp");
        this._oSearchHelpMetadata.setUseBatch(false);
    	
    };
    CustomController.prototype.getExcel = function () {
    	var id = this.getOwnerComponent().getModel("selectedDeal").getProperty("/dealID");
    	var sPath = "/DealHeaderSet('"+ id + "')/DealLicenseFeeSet/";
    	
    	var select = this._oTable.getColumns()[1].getProperty("sortProperty");

    	for( var i = 2 ; i < this._oTable.getColumns().length ; i++ ){
    		select = select + "," + this._oTable.getColumns()[i].getProperty("sortProperty");
    	}
   
    	
		var sUrl = this._oMetadata.sServiceUrl + sPath + "?$format=xlsx&$select=" + select;
	
		window.open(sUrl);
    };    
    CustomController.prototype._initTable = function () {
        this._initTableColumn();
        this._oTable.setTitle("Licensee Fee (0)");
        
        
        //this._initTableToolbar();
        this._initTableP13nDialog();

    };

    CustomController.prototype._initSearchHelpModel = function () {
		this.getView().setModel(new JSONModel(), 'PeriodID');
		this.getView().setModel(new JSONModel(), 'RoyaltyCatg');
    };
    
    CustomController.prototype.openP13n = function () {
		this._oP13nDialog.openDialog();
    };
 
      CustomController.prototype._initViewModel = function () {
		this.getView().setModel(new JSONModel({ editable : false }), 'oViewModel');

    };
    CustomController.prototype._initTableColumn = function () {
		
		
        // Create JSON model for table
        this.getView().setModel(new JSONModel(), 'oTableModel');
        var oColumns = this._oTable.getColumns();
        this._oTable.removeAllColumns();
        for( var i = 0 ; i < oColumns.length ; i++){
        	oColumns[i].data("p13nData", {
                columnKey: oColumns[i].mProperties.sortProperty
            });
            
            this._oTable.addColumn(oColumns[i]);
        }
		
        this._oTable.bindRows({
            path: "oTableModel>/"
        });
        

    };
    CustomController.prototype.setLicenseeFeeTabEditable = function (disable) {
    	this.getView().setModel(new JSONModel({ editable : disable }), 'oViewModel');
    };    
    CustomController.prototype.rebindLicenseeFeeTab = function () {
		this._rebindSearchHelp();
		this._rebindTable();
    };
    CustomController.prototype._rebindSearchHelp = function () {
        var that = this;
		var id = this.getOwnerComponent().getModel("selectedDeal").getProperty("/dealID");
        var oFilter = new sap.ui.model.Filter("DealID", sap.ui.model.FilterOperator.EQ, id);

		 this._oSearchHelpMetadata.read("/PeriodIDSet", {
			filters: [oFilter],
			success: function(oData, oResponse) {

                if (oData && oData.results) {
                    that.getView().getModel("PeriodID").setData(oData.results);
                }

			},
			error: function(oError) {
				console.log("Error", oError);
			}
		});
		this._oSearchHelpMetadata.read("/RoyaltyCatgSet", {
			filters: [oFilter],
			success: function(oData, oResponse) {

                if (oData && oData.results) {
                    that.getView().getModel("RoyaltyCatg").setData(oData.results);
                }

			},
			error: function(oError) {
				console.log("Error", oError);
			}
		});
    };
     CustomController.prototype._rebindTable = function () {
        var that = this;
		var id = this.getOwnerComponent().getModel("selectedDeal").getProperty("/dealID");
        this._oTable.setShowOverlay(true);

		 this._oMetadata.read("/DealHeaderSet('"+ id + "')/DealLicenseFeeSet", {
					 	
            success : function (oData) {
                // Remove abort object from the array

                if (oData && oData.results) {
                	// Convert Integer/Float for sorting functionality
                	for(var i=0;i<oData.results.length;i++) {
                		oData.results[i].DealChanged = "";
                		oData.results[i].ScopeID = parseInt(oData.results[i].ScopeID, 10);
                		oData.results[i].LicenseFeePerIncrement = parseFloat(oData.results[i].LicenseFeePerIncrement);
                		oData.results[i].NumOfIncrement = parseInt(oData.results[i].NumOfIncrement, 10);
                		oData.results[i].TotalLicenseFee = parseFloat(oData.results[i].TotalLicenseFee);
                	}
                	
                	var rowCount = oData.results.length;
                	that._oTable.setTitle("Dimension (" + rowCount + ")");
                    that.getView().getModel("oTableModel").setData(oData.results);
                    that.getView().setModel(new JSONModel({RowCount: rowCount }), "oLFCount");
                }
                that._oTable.setShowOverlay(false);
            },
            error: function (oError) {
                // Remove abort object from the array

                that.getView().getModel("oTableModel").setData([]);
                that._oTable.setShowOverlay(false);
            }
        });

    };
    CustomController.prototype.getSelectedRow = function () {

		return this.getView().getModel("oTableModel");
    };
    
    CustomController.prototype.selectRow = function (oEvent) {
		var index = oEvent.getSource().getParent().getBindingContext("oTableModel").getPath().substr(1);
		this.getView().getModel("oTableModel").oData[index].DealChanged = "true";
    };
        
	CustomController.prototype._initTableP13nDialog = function () {
        var that = this,
            oDefaultSetting = {
                column: {
                    items: [],
                    columnItems: []
                },
                sort: {
                    items: [],
                    sortItems: []
                },
                filter: {
                    items: [],
                    filterItems: []
                }
            };

        // var oEntityType = this._oUtility._getEntityType(this._oMetadata, this._TILE_INFO['TableEntityType']);
        // oEntityType.property.forEach(function (oProperty, iIndex) {
        //     // Skip some unnecessary columns
        //     if (oProperty.name === "GENERATED_ID" || oProperty.name === "SETTLDOC") { return; }

        //     // Setup column items
        //     oDefaultSetting.column.items.push({
        //         columnKey: oProperty.name,
        //         text: oProperty["sap:label"],
        //         tooltip: oProperty["sap:label"],
        //         visible: true
        //     });

        //     oDefaultSetting.column.columnItems.push({
        //         columnKey: oProperty.name,
        //         index: iIndex,
        //         visible: that._TILE_INFO['DefaultHideColumns'].indexOf(oProperty.name) >= 0 ? false : true
        //     });

        //     // Setup sort items
        //     oDefaultSetting.sort.items.push({
        //         columnKey: oProperty.name,
        //         text: oProperty["sap:label"],
        //         tooltip: oProperty["sap:label"],
        //         visible: true
        //     });

        //     if (oProperty.name === "SETTLEDATE") {
        //         oDefaultSetting.sort.sortItems.push({
        //             columnKey: oProperty.name,
        //             operation: sap.ui.table.SortOrder.Ascending
        //         });
        //     }

        //     if (oProperty.name === "SETTHOURENDING") {
        //         oDefaultSetting.sort.sortItems.push({
        //             columnKey: oProperty.name,
        //             operation: sap.ui.table.SortOrder.Ascending
        //         });
        //     }

        //     // Setup filter items ( Check the property is filterable or not )
        //     if (oProperty["sap:filterable"] !== "false") {
        //         oDefaultSetting.filter.items.push({
        //             columnKey: oProperty.name,
        //             text: oProperty["sap:label"],
        //             tooltip: oProperty["sap:label"],
        //             visible: true,
        //             type: P13nDialogController.FilterPanelItemType.String
        //         });
        //     }

        //     if (that._TILE_INFO['DefaultColumnFilter'] && that._TILE_INFO['DefaultColumnFilter'].Column === oProperty.name) {
        //         oDefaultSetting.filter.filterItems.push({
        //             key: [ oProperty.name, iIndex ].join("_"),
        //             columnKey: oProperty.name,
        //             exclude: false,
        //             operation: sap.ui.model.FilterOperator[that._TILE_INFO['DefaultColumnFilter'].Operation],
        //             value1: that._TILE_INFO['DefaultColumnFilter'].Value
        //         });
        //     }
        // });

        this._oP13nDialog = new P13nDialogController({
            setting: oDefaultSetting,
            table: this._oTable,
            p13nChange: function (oEvent) {
                this._rebind(oEvent.getParameters());
            }.bind(this)
        });
    };
    return CustomController;
});