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
   
    var CustomController = Controller.extend("wb.cosmos.dealapp.controller.RightsDimTable");

    CustomController.prototype.onInit = function () {

        this._oTable = this.getView().byId("wb-RightsDim");
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
    
    
    CustomController.prototype._initMetadataModel = function () {
    
        this._oMetadata = this.getOwnerComponent().getModel("dealInfo");
        this._oMetadata.setDefaultCountMode(sap.ui.model.odata.CountMode.Request);
        this._oSearchHelpMetadata = this.getOwnerComponent().getModel("dealSearchHelp");
        this._oSearchHelpMetadata.setUseBatch(false);
    };
  	CustomController.prototype.clearAllFilters = function(oEvent) {
			var oTable = this.getView().byId("wb-RightsDim");
 
		
 
			var aColumns = oTable.getColumns();
			for (var i=0; i<aColumns.length; i++) {
				oTable.filter(aColumns[i], null);
			}
		};    
    CustomController.prototype.getExcel = function () {
    	var id = this.getOwnerComponent().getModel("selectedDeal").getProperty("/dealID");
    	var sPath = "/DealHeaderSet('"+ id + "')/DealDimensionSet/";
    	
    	var select = "DealID";
    	for( var i = 1 ; i < this._oTable.getColumns().length ; i++ ){
   			select = select + "," + this._oTable.getColumns()[i].getProperty("sortProperty");
    	} 
    	
		var sUrl = this._oMetadata.sServiceUrl + sPath + "?$format=xlsx&$select=" + select;
		window.open(sUrl);
    };   
    
    CustomController.prototype._initTable = function () {
        this._initTableColumn();
        this._oTable.setTitle("Rights Dimensions (0)");
        
        //this._initTableToolbar();
        this._initTableP13nDialog();
    };
    
    CustomController.prototype.selectAll = function () {
    	var selectAllRows = this.getView().getModel("oTableModel").aBindings[0].aIndices;
		var oTableModel = this.getView().getModel("oTableModel");
    	
    	for ( var i=0 ; i<selectAllRows.length ; i++ ) {
	    	var index = selectAllRows[i];
	    	// Switch - True / False
	    	if ( oTableModel.oData[index].DealChanged === "false" )
				oTableModel.oData[index].DealChanged = "true";
			else
				oTableModel.oData[index].DealChanged = "false";
    	}
    	oTableModel.refresh();
    	this.getView().getModel(oTableModel,"oTableModel");
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
	
				if (checkMatch === true) {
		            for( var i = 1 ; i < obj.data.length ; i ++ ) {
		            	for (var j = 0 ; j < oTableModel.oData.length ; j++) {
		              		if( parseInt(obj.data[i][1],10) === oTableModel.oData[j].ScopeID && obj.data[i][0] === oTableModel.oData[j].DealID  ){
		              			oTableModel.oData[j].DealChanged = "true";
		              			oTableModel.oData[j].Media = String(obj.data[i][5]);
		              			oTableModel.oData[j].Territory = obj.data[i][6];
		              			oTableModel.oData[j].Language = obj.data[i][7];
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
    
    CustomController.prototype._getDimensionsEditor = function () {
         if (!this._oDialog) {
            this._oDialog = sap.ui.xmlfragment("wb.cosmos.dealapp.view.DealMasterDetail.DetailTabs.DimensionEditor",this);
            this.getView().addDependent(this._oDialog);
            
        	sap.ui.getCore().byId('multiMediaAdd').setFilterFunction(function(sTerm, oItem) {
				// A case-insensitive 'string contains' style filter
				return oItem.getText().match(new RegExp(sTerm, "i"));
		 	});
		 	
		 	sap.ui.getCore().byId('multiTerriAdd').setFilterFunction(function(sTerm, oItem) {
				// A case-insensitive 'string contains' style filter
				return oItem.getText().match(new RegExp(sTerm, "i"));
		 	});
		 	
		 	sap.ui.getCore().byId('multiLanguAdd').setFilterFunction(function(sTerm, oItem) {
				// A case-insensitive 'string contains' style filter
				return oItem.getText().match(new RegExp(sTerm, "i"));
		 	});
		 	
		 	sap.ui.getCore().byId('multiMediaDel').setFilterFunction(function(sTerm, oItem) {
				// A case-insensitive 'string contains' style filter
				return oItem.getText().match(new RegExp(sTerm, "i"));
		 	});
		 	
		 	sap.ui.getCore().byId('multiTerriDel').setFilterFunction(function(sTerm, oItem) {
				// A case-insensitive 'string contains' style filter
				return oItem.getText().match(new RegExp(sTerm, "i"));
		 	});
		 	
		 	sap.ui.getCore().byId('multiLanguDel').setFilterFunction(function(sTerm, oItem) {
				// A case-insensitive 'string contains' style filter
				return oItem.getText().match(new RegExp(sTerm, "i"));
		 	});
         }
         return this._oDialog;
    };
    CustomController.prototype.closeDimension = function (mode) {
    	sap.ui.getCore().byId('multiMediaAdd').removeAllTokens();
    	sap.ui.getCore().byId('multiMediaDel').removeAllTokens();
    	
    	// Get the Territory Array to be added/deleted
    	sap.ui.getCore().byId('multiTerriAdd').removeAllTokens();
    	sap.ui.getCore().byId('multiTerriDel').removeAllTokens();
    	
    	// Get the Language Array to be added/deleted
    	sap.ui.getCore().byId('multiLanguAdd').removeAllTokens();
    	sap.ui.getCore().byId('multiLanguDel').removeAllTokens();
		this._getDimensionsEditor().close();
    };
    CustomController.prototype.editDimension = function () {
    	//this._getDimensionsEditor().open();
		var dimPopup = this._getDimensionsEditor();

		
/*		// Media Add Filter
        var oMediaAdd = sap.ui.getCore().byId("comboMediaAdd");
        oMediaAdd.setFilterFunction(function(sTerm, oItem) {
	      return oItem.getText().match(new RegExp(sTerm, "i"));
		});
		
		// Media Del Filter
        var oMediaDel = sap.ui.getCore().byId("comboMediaDel");
        oMediaDel.setFilterFunction(function(sTerm, oItem) {
	      return oItem.getText().match(new RegExp(sTerm, "i"));
		}); */
		
		dimPopup.open();
    }; 
    CustomController.prototype._initSearchHelpModel = function () {
		// this.getView().setModel(this.getOwnerComponent().getModel("MediaSearchHelp"), 'Media');
		// this.getView().setModel(this.getOwnerComponent().getModel("TerriSearchHelp"), 'Terri');
		// this.getView().setModel(this.getOwnerComponent().getModel("LanguSearchHelp"), 'Langu');
		var oMediaModel = this.getOwnerComponent().getModel("MediaSearchHelp");
		oMediaModel.setSizeLimit(500);
		this.getView().setModel(oMediaModel, 'Media');
		var oTerriModel = this.getOwnerComponent().getModel("TerriSearchHelp");
		oTerriModel.setSizeLimit(800);
		this.getView().setModel(oTerriModel, 'Terri');
		var oLanguModel = this.getOwnerComponent().getModel("LanguSearchHelp");
		oLanguModel.setSizeLimit(500);
		this.getView().setModel(oLanguModel, 'Langu');
    };
    CustomController.prototype.updateDimension = function() {
    	jQuery.sap.require("wb.cosmos.dealapp.util.papaparse");
    	// Get the table model
    	var tabModel = this.getView().getModel("oTableModel");
    	
    	// Get the Media Array to be added/deleted
    	var medAdd = sap.ui.getCore().byId('multiMediaAdd').getTokens();
    	var medDel = sap.ui.getCore().byId('multiMediaDel').getTokens();
    	
    	// Get the Territory Array to be added/deleted
    	var terAdd = sap.ui.getCore().byId('multiTerriAdd').getTokens();
    	var terDel = sap.ui.getCore().byId('multiTerriDel').getTokens();
    	
    	// Get the Language Array to be added/deleted
    	var lanAdd = sap.ui.getCore().byId('multiLanguAdd').getTokens();
    	var lanDel = sap.ui.getCore().byId('multiLanguDel').getTokens();
    	
    	for ( var i = 0 ; i < tabModel.oData.length ; i++ ) {
			if( tabModel.oData[i].DealChanged === "true" ) {
				// Parse Individual Strings
				// Media
		    	var objMedia = Papa.parse(tabModel.oData[i].Media);
		    	var lenMed = objMedia.data[0].length;
		    	// Territory
		    	var objTerri = Papa.parse(tabModel.oData[i].Territory);
		    	var lenTer = objTerri.data[0].length;
		    	var objTerriCode = Papa.parse(tabModel.oData[i].TerrCode);
		    	
		    	// Language
		    	var objLangu = Papa.parse(tabModel.oData[i].Language);
		    	var lenLan = objLangu.data[0].length;
		    	var objLanguCode = Papa.parse(tabModel.oData[i].LangCode);
		    
		    	
				// MEDIA - ADD
				for ( var m = 0 ; m < medAdd.length ; m++ ) {
					var medArr = medAdd[m].getText().split("|");
					// Check whether media is already added
					if ( tabModel.oData[i].Media.indexOf(medArr[1].trim()) === -1 ) {
						// Good to add
/*						var mediaConcat = "," + medAdd[m];
						tabModel.oData[i].Media = tabModel.oData[i].Media.concat(mediaConcat); */
						objMedia.data[0][lenMed] = medArr[1].trim();
						lenMed = lenMed + 1;
						//tabModel.oData[i].Media += medAdd[m];
					}
				}
				// MEDIA - DELETE
				for ( var m = 0 ; m < medDel.length ; m++ ) {
					var medArr = medDel[m].getText().split("|");
					// Check whether media is already present
					if ( objMedia.data[0].indexOf(medArr[1].trim()) !== -1 ) {
						var ind = objMedia.data[0].indexOf(medArr[1].trim());
						objMedia.data[0].splice(ind, 1);
					}
/*					if ( tabModel.oData[i].Media.indexOf(medDel[m]) !== -1 ) {
						// Good to delete
						var mediaConcat = "," + medDel[m];
						tabModel.oData[i].Media = tabModel.oData[i].Media.replace(mediaConcat, ''); 
						
						
						//tabModel.oData[i].Media += medAdd[m];
					} */
				}
				// Concatenate back the strings
				tabModel.oData[i].Media = '';
				for ( var l = 0 ; l < objMedia.data[0].length ; l++ ) {
					if ( l === 0 ) {
						tabModel.oData[i].Media = objMedia.data[0][l];
					} else {
						tabModel.oData[i].Media = tabModel.oData[i].Media + "," + objMedia.data[0][l];
					}
				}
				
				// TERRI - ADD
				for ( var m = 0 ; m < terAdd.length ; m++ ) {
					// Check whether territory is already added
					var terArr = terAdd[m].getText().split("|");
					if ( tabModel.oData[i].Territory.indexOf(terArr[0].trim()) === -1 ) {
						// Good to add
/*						var terriConcat = "," + terAdd[m];
						tabModel.oData[i].Territory = tabModel.oData[i].Territory.concat(terriConcat); */
						objTerri.data[0][lenTer] = terArr[0].trim();
						objTerriCode.data[0][lenTer] = terArr[1].trim();
						lenTer = lenTer + 1;
						//tabModel.oData[i].Territory += terAdd[m];
					}
				}
				// TERRI - DELETE
				for ( var m = 0 ; m < terDel.length ; m++ ) {
					var terArr = terDel[m].getText().split("|");
					// Check whether territory is already present
					if ( objTerri.data[0].indexOf(terArr[0].trim()) !== -1 ) {
						var ind = objTerri.data[0].indexOf(terArr[0].trim());
						objTerri.data[0].splice(ind, 1);
						objTerriCode.data[0].splice(ind, 1);
					}
/*					if ( tabModel.oData[i].Territory.indexOf(terDel[m]) !== -1 ) {
						// Good to delete
						var terriConcat = "," + terDel[m];
						tabModel.oData[i].Territory = tabModel.oData[i].Territory.replace(terriConcat, '');
						tabModel.oData[i].Territory = tabModel.oData[i].Territory.replace(terDel[m], ''); 
						//tabModel.oData[i].Territory += terDel[m];
					} */
				} 
				tabModel.oData[i].Territory = '';
				tabModel.oData[i].TerrCode = '';
				for ( var l = 0 ; l < objTerri.data[0].length ; l++ ) {
					if ( l === 0 ) {
						tabModel.oData[i].Territory = objTerri.data[0][l];
						tabModel.oData[i].TerrCode = objTerriCode.data[0][l];
					} else {
						tabModel.oData[i].Territory = tabModel.oData[i].Territory + "," + objTerri.data[0][l];
						tabModel.oData[i].TerrCode = tabModel.oData[i].TerrCode + "," + objTerriCode.data[0][l];
					}
				}
				// LANGU - ADD
				for ( var m = 0 ; m < lanAdd.length ; m++ ) {
					var lanArr = lanAdd[m].getText().split("|");
					// Check whether language is already added
					if ( tabModel.oData[i].Language.indexOf(lanArr[0].trim()) === -1 ) {
						// Good to add
/*						var languConcat = "," + lanAdd[m];
						tabModel.oData[i].Language = tabModel.oData[i].Language.concat(languConcat); */
						objLangu.data[0][lenLan] = lanArr[0].trim();
						objLanguCode.data[0][lenLan] = lanArr[1].trim();
						lenLan = lenLan + 1;
						//tabModel.oData[i].Language += lanAdd[m];
					}
				}
				// LANGU - DELETE
				for ( var m = 0 ; m < lanDel.length ; m++ ) {
					var lanArr = lanDel[m].getText().split("|");
					// Check whether language is already present
					if ( objLangu.data[0].indexOf(lanArr[0].trim()) !== -1 ) {
						var ind = objLangu.data[0].indexOf(lanArr[0].trim());
						objLangu.data[0].splice(ind, 1);
						objLanguCode.data[0].splice(ind, 1);
					}
/*					if ( tabModel.oData[i].Language.indexOf(lanDel[m]) !== -1 ) {
						// Good to delete
						var languConcat = "," + lanDel[m];
						tabModel.oData[i].Language = tabModel.oData[i].Language.replace(languConcat, '');
						tabModel.oData[i].Language = tabModel.oData[i].Language.replace(lanDel[m], '');
						//tabModel.oData[i].Language += lanDel[m];
					} */
				}  
				tabModel.oData[i].Language = '';
				tabModel.oData[i].LangCode = '';
				for ( var l = 0 ; l < objLangu.data[0].length ; l++ ) {
					if ( l === 0 ) {
						tabModel.oData[i].Language = objLangu.data[0][l];
						tabModel.oData[i].LangCode = objLanguCode.data[0][l];
					} else {
						tabModel.oData[i].Language = tabModel.oData[i].Language + "," + objLangu.data[0][l];
						tabModel.oData[i].LangCode = tabModel.oData[i].LangCode + "," + objLanguCode.data[0][l];
					}
				}				
			}
    	}
    	
    	// Refresh Table Model
    	tabModel.refresh();
    	this.getView().setModel(tabModel, "oTableModel");
    	sap.ui.getCore().byId('multiMediaAdd').removeAllTokens();
    	sap.ui.getCore().byId('multiMediaDel').removeAllTokens();
    	
    	// Get the Territory Array to be added/deleted
    	sap.ui.getCore().byId('multiTerriAdd').removeAllTokens();
    	sap.ui.getCore().byId('multiTerriDel').removeAllTokens();
    	
    	// Get the Language Array to be added/deleted
    	sap.ui.getCore().byId('multiLanguAdd').removeAllTokens();
    	sap.ui.getCore().byId('multiLanguDel').removeAllTokens();
    	
    	this._getDimensionsEditor().close();
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
    
    CustomController.prototype.setEditRightsDimTabEditable = function (disable) {
//    	this.getView().setModel(new JSONModel({ editable : "false" }), 'oViewModel');
    	this.getView().setModel(new JSONModel({ editable : disable }), 'oViewModel');
    }; 
    
    CustomController.prototype.rebindRightsDimTab = function () {
//    	this.getView().setModel(new JSONModel({ editable : "true" }), 'oViewModel');
//		this._rebindSearchHelp();
		this._rebindTable();
    };
    
/*    CustomController.prototype._rebindSearchHelp = function () {
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
    }; */
    
    CustomController.prototype._rebindTable = function () {
        var that = this;
		var id = this.getOwnerComponent().getModel("selectedDeal").getProperty("/dealID");
        this._oTable.setShowOverlay(true);

		 this._oMetadata.read("/DealHeaderSet('"+ id + "')/DealDimensionSet", {
					 	
            success : function (oData) {
                // Remove abort object from the array

                if (oData && oData.results) {
                	// Set ToolTip
                	// for(var i=0;i<oData.results.length;i++) {
                		// oData.results[i].DealChanged = "";
                		// oData.results[i].ScopeID = parseInt(oData.results[i].ScopeID, 10);
                		/*oData.results[i].LicenseFeePerIncrement = parseFloat(oData.results[i].LicenseFeePerIncrement);
                		oData.results[i].NumOfIncrement = parseInt(oData.results[i].NumOfIncrement, 10);
                		oData.results[i].TotalLicenseFee = parseFloat(oData.results[i].TotalLicenseFee); */
                	// }
                	
                	var rowCount = oData.results.length;
                	that._oTable.setTitle("Rights Dimensions (" + rowCount + ")");
                    that.getView().getModel("oTableModel").setData(oData.results);
                    that.getView().setModel(new JSONModel({RowCount: rowCount }), "oRightsDimCount");
                    
                    // ToolTip
           //         var oRttTextField = new sap.ui.commons.RichTooltip({
			        // 	text : "{oTableModel>Media}",
			        // 	valueStateText : "Tooltip"
			        // });
           //         that.getView().byId("txtMedia").setTooltip(oRttTextField);
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