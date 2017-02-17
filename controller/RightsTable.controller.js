sap.ui.define([
	"jquery.sap.global",
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/odata/v2/ODataModel",
    "wb/cosmos/dealapp/util/Formatter",
 
    "sap/ui/table/Column",
    "sap/ui/table/SortOrder",
    "sap/ui/model/Sorter",
    "sap/ui/commons/RichTooltip",
    "sap/m/MessageBox",
    "sap/m/Toolbar",
    "sap/m/ToolbarSpacer",
    "sap/m/Button",
    "sap/m/Label",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/Sorter",
    "wb/cosmos/dealapp/util/papaparse"

], function($, Controller, JSONModel, ODataModel, Column, Toolbar, ToolbarSpacer, Button, Label, Filter, FilterOperator, Sorter, SortOrder) {
	"use strict";
   
    var CustomController = Controller.extend("wb.cosmos.dealapp.controller.RightsTable");

    CustomController.prototype.onInit = function () {

        this._oTable = this.getView().byId("wb-Rights");
        this._oMetadata = null;
        this._oSearchHelpMetadata = null;
        this._oP13nDialog = null;
       
        // Startup functions
        // this._subscribeEvents();
        // this._initTableP13nDialog();
        this._initMetadataModel();
        this._initTable();
        this._initSearchHelpModel();
        this._initViewModel();
       
    };
    
        CustomController.prototype._getPeriodText = function (id) {
    	var periodIDtab = this.getView().getModel("PeriodID").oData;
    	for( var i = 0 ; i < periodIDtab.length ; i++ ){
    		if( periodIDtab[i].PrdID === id){
    			return periodIDtab[i].PrdID + " " +  periodIDtab[i].PrdDesc;
    		}
    	}
    };
    
    CustomController.prototype._getCatText = function (id) {
    	var catIDtab = this.getView().getModel("RoyaltyCatg").oData;
    	for( var i = 0 ; i < catIDtab.length ; i++ ){
    		if( catIDtab[i].RoyCat === id){
    			return catIDtab[i].RoyCat + " " +  catIDtab[i].RoyCatDesc;
    		}
    	}
    };
    
   	CustomController.prototype.clearAllFilters = function(oEvent) {
			var oTable = this.getView().byId("wb-Rights");
 
		
 
			var aColumns = oTable.getColumns();
			for (var i=0; i<aColumns.length; i++) {
				oTable.filter(aColumns[i], null);
			}
		};     
    CustomController.prototype._initMetadataModel = function () {
    
        this._oMetadata = this.getOwnerComponent().getModel("dealInfo");
        this._oMetadata.setDefaultCountMode(sap.ui.model.odata.CountMode.Request);
        this._oSearchHelpMetadata = this.getOwnerComponent().getModel("dealSearchHelp");
        this._oSearchHelpMetadata.setUseBatch(false);
    };
    
    CustomController.prototype.getExcel = function () {
    	var id = this.getOwnerComponent().getModel("selectedDeal").getProperty("/dealID");
    	var sPath = "/DealHeaderSet('"+ id + "')/DealRightsSet/";
    	
    	var select = "DealID";
    	for( var i = 1 ; i < this._oTable.getColumns().length ; i++ ){
    		if (this._oTable.getColumns()[i].getProperty("sortProperty") === "PeriodID")
    			select = select + "," + "PeriodYearID";
    		else if (this._oTable.getColumns()[i].getProperty("sortProperty") === "RoyCat")
    			select = select + "," + "RoyaltyCatg";
    		else
    			select = select + "," + this._oTable.getColumns()[i].getProperty("sortProperty");
    	} 
    	
		var sUrl = this._oMetadata.sServiceUrl + sPath + "?$format=xlsx&$select=" + select;
		window.open(sUrl);
    };   
    
    CustomController.prototype._initTable = function () {
        this._initTableColumn();
        this._oTable.setTitle("Rights (0)");
        
        //this._initTableToolbar();
        this._initTableP13nDialog();
    };
    
    CustomController.prototype.handleCSVUploaded = function (e){
 	    jQuery.sap.require("wb.cosmos.dealapp.util.papaparse");
 	    var oRb = this.getOwnerComponent().getModel("i18n").getResourceBundle();
        var file = e.getParameter("files") && e.getParameter("files")[0];
        
        if(file && window.FileReader) {  
			var reader = new FileReader();  
            var that = this;  
            
        	reader.onload = function(evn) {  
                var strCSV = evn.target.result; //string in CSV 
	            var obj = Papa.parse(strCSV);
	            var oTableModel = that.getView().getModel("oTableModel");
	            var checkMatch = false;
	            
	            // Validation for Deal ID - Scope ID match
	            for( var i = 1 ; i < obj.data.length ; i ++ ) {
	            	checkMatch = false;
	            	if(obj.data[i][0] === "" || obj.data[i][1] === "") {
	            		checkMatch = true;
	            		continue;
	            	}
	            	for (var j = 0 ; j < oTableModel.oData.length ; j++) {
	              		if( parseInt(obj.data[i][1],10) === oTableModel.oData[j].ScopeID && obj.data[i][0] === oTableModel.oData[j].DealID ) {
	              			checkMatch = true;
	              			break;
	              		}
	            	}
	            	if (checkMatch === false) {
	            		sap.m.MessageBox.information(
							oRb.getText("dealScopeMismatch",obj.data[i][0],parseInt(obj.data[i][1],10)),
							{
								styleClass:"sapUiSizeCompact"
							}
						);
	            		break;
	            	}
				}
	
				// if (checkMatch === true) {
				// Check for another tab data being uploaded (Check number of columns match)
				if (checkMatch === true && obj.data[0].length === 18) {
		            for( var i = 1 ; i < obj.data.length ; i ++ ) {
		            	for (var j = 0 ; j < oTableModel.oData.length ; j++) {
		              		if( parseInt(obj.data[i][1],10) === oTableModel.oData[j].ScopeID && obj.data[i][0] === oTableModel.oData[j].DealID  ){
		              			oTableModel.oData[j].DealChanged = "true";
		              			oTableModel.oData[j].PeriodYearID = String(obj.data[i][5]);
		              			var datearr = obj.data[i][7].split("/");
		              			oTableModel.oData[j].ValidFrom = datearr[2] + ( '0' + datearr[0] ).slice(-2) + ( '0' + datearr[1] ).slice(-2);
		              			oTableModel.oData[j].ValidFromStatus = obj.data[i][8];
		              			datearr = obj.data[i][9].split("/");
		              			oTableModel.oData[j].ValidTo = datearr[2] + ( '0' + datearr[0] ).slice(-2) + ( '0' + datearr[1] ).slice(-2);
		             
		              			oTableModel.oData[j].ValidToStatus = obj.data[i][10];
		              			// oTableModel.oData[j].Exclusivity = obj.data[i][11];
		              			// Remove hyphen (if any) for non-exclusive
		              			var exclusivity = String(obj.data[i][11]).replace(/-/g, '');
		              			// Remove white spaces between strings
		              			exclusivity = exclusivity.replace(/ /g, '');
		              			// Convert to uppercase
		              			oTableModel.oData[j].Exclusivity = exclusivity.toUpperCase();
		              			oTableModel.oData[j].RunsUOMUnit1 = String(obj.data[i][12]);
		              			oTableModel.oData[j].RunsUOM1 = ("0000" + String(obj.data[i][13])).substr(-4,4);
		              			oTableModel.oData[j].RunsUOMUnit2 = String(obj.data[i][14]);
		              			oTableModel.oData[j].RunsUOM2 = ("0000" + String(obj.data[i][15])).substr(-4,4);
		              			oTableModel.oData[j].RunsUOMUnit3 = String(obj.data[i][16]);
		              			oTableModel.oData[j].RunsUOM3 = ("0000" + String(obj.data[i][17])).substr(-4,4);
		              			var RoyaltyCatgHelp = that.getView().getModel('RoyaltyCatg');
								for(var k = 0; k < RoyaltyCatgHelp.oData.length; k++){
									var catExcel = String(obj.data[i][6],10);
									catExcel = catExcel.toUpperCase();
									var catSrhHelp = RoyaltyCatgHelp.oData[k].RoyCat;
									catSrhHelp = catSrhHelp.toUpperCase();
									if( catExcel === catSrhHelp ){
										oTableModel.oData[j].RoyaltyCatg = RoyaltyCatgHelp.oData[k].RoyCat;
									}
								}
	//	              			break;
		              		}
		            	}
					}
					sap.m.MessageBox.information(
						oRb.getText("dealUploadSuccess"),
						{
							styleClass:"sapUiSizeCompact"
						}
					);
				} else {
					sap.m.MessageBox.information(
							oRb.getText("columnMismatch"),
							{
								styleClass:"sapUiSizeCompact"
							}
						);
				}
				
//            	that.getView().getModel("oTableModel").setData(oTableModel.oData);

				// Refresh Table Model
				file = '';
				oTableModel.refresh();
				that.getView().setModel(oTableModel, "oTableModel");
            };
            reader.readAsText(file); 
        }
	};
    
    CustomController.prototype._initSearchHelpModel = function () {
		this.getView().setModel(new JSONModel(), 'PeriodID');
		this.getView().setModel(new JSONModel(), 'RoyaltyCatg');
		this.getView().setModel(new JSONModel(), 'RunsUOM');
    };
    
    CustomController.prototype.openP13n = function () {
		this._oP13nDialog.openDialog();
    };
    
    CustomController.prototype._initViewModel = function () {
//		this.getView().setModel(new JSONModel({ editable : "true" }), 'oViewModel');
		this.getView().setModel(new JSONModel({ editable : false }), 'oViewModel');
    };
    
    CustomController.prototype._initTableColumn = function () {
        // Create JSON model for table
        this.getView().setModel(new JSONModel(), 'oTableModel');
        var oColumns = this._oTable.getColumns();
        this._oTable.removeAllColumns();
        
        // this.byId("dpValidTo").setDisplayFormat(this.getOwnerComponent().getModel("userFormatting").oData.DateFormat);
        // this.byId("dpValidFrom").setDisplayFormat(this.getOwnerComponent().getModel("userFormatting").oData.DateFormat);
    	var dateFormat = this.getOwnerComponent().getModel("userFormatting").oData.DateFormat;
		dateFormat = dateFormat.replace(/D/g, 'd');
		dateFormat = dateFormat.replace(/Y/g, 'y');
		this.byId("dpValidTo").setDisplayFormat(dateFormat);
        this.byId("dpValidFrom").setDisplayFormat(dateFormat);
		
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
    
    CustomController.prototype.setEditRightsTabEditable = function (disable) {
//    	this.getView().setModel(new JSONModel({ editable : "false" }), 'oViewModel');
    	this.getView().setModel(new JSONModel({ editable : disable }), 'oViewModel');
    }; 
    
    CustomController.prototype.rebindRightsTab = function () {
//    	this.getView().setModel(new JSONModel({ editable : "true" }), 'oViewModel');
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
		this._oSearchHelpMetadata.read("/RunsUomSet", {
			filters: [oFilter],
			success: function(oData, oResponse) {

                if (oData && oData.results) {
                    that.getView().getModel("RunsUOM").setData(oData.results);
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

		 this._oMetadata.read("/DealHeaderSet('"+ id + "')/DealRightsSet", {
					 	
            success : function (oData) {
                // Remove abort object from the array

                if (oData && oData.results) {
                	// Convert Integer/Float for sorting functionality
                	for(var i=0;i<oData.results.length;i++) {
                		oData.results[i].DealChanged = "";
                		oData.results[i].ScopeID = parseInt(oData.results[i].ScopeID, 10);
                		oData.results[i].PeriodYearGroup = that._getPeriodText(oData.results[i].PeriodYearID);
                		oData.results[i].RoyCatgDescr = that._getCatText(oData.results[i].RoyaltyCatg);
                		/*oData.results[i].LicenseFeePerIncrement = parseFloat(oData.results[i].LicenseFeePerIncrement);
                		oData.results[i].NumOfIncrement = parseInt(oData.results[i].NumOfIncrement, 10);
                		oData.results[i].TotalLicenseFee = parseFloat(oData.results[i].TotalLicenseFee);*/
                	}
                	
                	var rowCount = oData.results.length;
                	that._oTable.setTitle("Rights (" + rowCount + ")");
                    that.getView().getModel("oTableModel").setData(oData.results);
                    that.getView().setModel(new JSONModel({RowCount: rowCount }), "oRightsCount");
                }
                // Default sorting for Scope ID
                that._oTable.sort(that._oTable.getColumns()[1]);
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
		
		if ( this.getView().getModel("oTableModel").oData[index].ValidFromStatus === "TBA" ) {
			this.getView().getModel("oTableModel").oData[index].ValidFrom = "19000101";
		}
		
		if ( this.getView().getModel("oTableModel").oData[index].ValidToStatus === "TBA" ) {
			this.getView().getModel("oTableModel").oData[index].ValidTo = "99991231";
		}
		
		if( oEvent.getSource().sId.search("PeriodCombo") !== -1 ){
			this.getView().getModel("oTableModel").oData[index].PeriodYearGroup = oEvent.getSource().mProperties.value;
		}
		if( oEvent.getSource().sId.search("RoyaltyCombo") !== -1 ){
			this.getView().getModel("oTableModel").oData[index].RoyCatgDescr = oEvent.getSource().mProperties.value;
		}
    };
    
    CustomController.prototype.selectRowDateFrom = function (oEvent) {
    	var oTableModel = this.getView().getModel("oTableModel");
    	var index = oEvent.getSource().getParent().getBindingContext("oTableModel").getPath().substr(1);
		this.getView().getModel("oTableModel").oData[index].DealChanged = "true";
		
		if ( this.getView().getModel("oTableModel").oData[index].ValidFrom === '' ) {
			var sHtml = "<strong>Valid From cannot be blank</strong>";
			var oRttTextField = new sap.ui.commons.RichTooltip({
	        	text : sHtml,
	        	valueStateText : "An error occured!"
	        });
	        
	        oEvent.getSource().setTooltip(oRttTextField);
	        oEvent.getSource().setValueState("Error");
		} else if ( oEvent.getParameter("valid") === false ) {
			var sHtml = "<strong>The date entered is invalid!</strong>";
			var oRttTextField = new sap.ui.commons.RichTooltip({
	        	text : sHtml,
	        	valueStateText : "An error occured!"
	        });
	        
	        oEvent.getSource().setTooltip(oRttTextField);
	        oEvent.getSource().setValueState("Error");
		} else if ( this.getView().getModel("oTableModel").oData[index].ValidFrom > 
			 this.getView().getModel("oTableModel").oData[index].ValidTo ) {
			var sHtml = "<strong>Valid From cannot be greater than Valid To</strong>";
	        
	        var oRttTextField = new sap.ui.commons.RichTooltip({
	        	text : sHtml,
	        	valueStateText : "An error occured!"
	        });
	        
	        oEvent.getSource().setTooltip(oRttTextField);
	        oEvent.getSource().setValueState("Error");
		} else {
			oEvent.getSource().setTooltip("");
			oEvent.getSource().setValueState("None");
		}
		oTableModel.refresh();
    };
    
    CustomController.prototype.selectRowDateTo = function (oEvent) {
    	var oTableModel = this.getView().getModel("oTableModel");
    	var index = oEvent.getSource().getParent().getBindingContext("oTableModel").getPath().substr(1);
		this.getView().getModel("oTableModel").oData[index].DealChanged = "true";
		
		if ( this.getView().getModel("oTableModel").oData[index].ValidTo === '' ) {
			var sHtml = "<strong>Valid To cannot be blank</strong>";
			var oRttTextField = new sap.ui.commons.RichTooltip({
	        	text : sHtml,
	        	valueStateText : "An error occured!"
	        });
	        
	        oEvent.getSource().setTooltip(oRttTextField);
	        oEvent.getSource().setValueState("Error");
		} else if ( oEvent.getParameter("valid") === false ) {
			var sHtml = "<strong>The date entered is invalid!</strong>";
			var oRttTextField = new sap.ui.commons.RichTooltip({
	        	text : sHtml,
	        	valueStateText : "An error occured!"
	        });
	        
	        oEvent.getSource().setTooltip(oRttTextField);
	        oEvent.getSource().setValueState("Error");
		} else if ( this.getView().getModel("oTableModel").oData[index].ValidFrom > 
			 this.getView().getModel("oTableModel").oData[index].ValidTo ) {
	        var sHtml = "<strong>Valid From cannot be greater than Valid To</strong>";
	        
	        var oRttTextField = new sap.ui.commons.RichTooltip({
	        	text : sHtml,
	        	valueStateText : "An error occured!"
	        });
	        
	        oEvent.getSource().setTooltip(oRttTextField);
	        oEvent.getSource().setValueState("Error");
		} else {
			oEvent.getSource().setTooltip("");
			oEvent.getSource().setValueState("None");
		}
		oTableModel.refresh();
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

        // this._oP13nDialog = new P13nDialogController({
        //     setting: oDefaultSetting,
        //     table: this._oTable,
        //     p13nChange: function (oEvent) {
        //         this._rebind(oEvent.getParameters());
        //     }.bind(this)
        // });
    };

    return CustomController;
});