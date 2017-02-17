sap.ui.define([
	"jquery.sap.global",
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/odata/v2/ODataModel",

    "wb/cosmos/dealapp/util/Formatter",
    "sap/ui/table/Column",
    "sap/m/Toolbar",
    "sap/m/ToolbarSpacer",
    "sap/m/Button",
    "sap/m/Label",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
     "wb/cosmos/dealapp/util/papaparse"

], function($, Controller, JSONModel, ODataModel,Formatter, Column, Toolbar, ToolbarSpacer, Button, Label, Filter, FilterOperator,papaparse) {
	"use strict";
   
    var CustomController = Controller.extend("wb.cosmos.dealapp.controller.LicenseFeeTable");
 
    CustomController.prototype.onInit = function () {

        this._oTable = this.getView().byId("wb-licenseeFee");
        this._oMetadata = null;
        this._oSearchHelpMetadata = null;
        this._oP13nDialog = null;

        // Startup functions
        this._initMetadataModel();
        this._initTable();
											
        this._initSearchHelpModel();
        this._initViewModel();
    };
 	CustomController.prototype.clearAllFilters = function(oEvent) {
			var oTable = this.getView().byId("wb-licenseeFee");
 
		
 
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
    	var sPath = "/DealHeaderSet('"+ id + "')/DealLicenseFeeSet/";
    	
    	var select = "DealID";
    	for( var i = 1 ; i < this._oTable.getColumns().length ; i++ ){
    		select = select + "," + this._oTable.getColumns()[i].getProperty("sortProperty");
    	}
   
		var sUrl = this._oMetadata.sServiceUrl + sPath + "?$format=xlsx&$select=" + select;
		window.open(sUrl);
    };    
    
    CustomController.prototype._initTable = function () {
        this._initTableColumn();
        this._oTable.setTitle("Licensee Fee (0)");
    };

    CustomController.prototype.handleCSVUploaded = function (e){
 	    jQuery.sap.require("wb.cosmos.dealapp.util.papaparse");
 	    var oRb = this.getOwnerComponent().getModel("i18n").getResourceBundle();
        var file = e.getParameter("files") && e.getParameter("files")[0];
        
        if(file && window.FileReader) {  
			var reader = new FileReader();  
            var that = this;  
            
        	reader.onload = function(evn) {  
                var strCSV= evn.target.result; //string in CSV 
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
				if (checkMatch === true && obj.data[0].length === 15) {
		            for( var i = 1 ; i < obj.data.length ; i ++ ) {
		            	for (var j = 0 ; j < oTableModel.oData.length ; j++) {
		              		if( parseInt(obj.data[i][1],10) === oTableModel.oData[j].ScopeID && obj.data[i][0] === oTableModel.oData[j].DealID  ){
		              			oTableModel.oData[j].LicenseFeePerIncrement = parseFloat(obj.data[i][10],10);
		              			oTableModel.oData[j].NumOfIncrement = parseInt(obj.data[i][11],10);
		              			oTableModel.oData[j].TotalLicenseFee = parseInt(oTableModel.oData[j].NumOfIncrement) === 0 ? oTableModel.oData[j].LicenseFeePerIncrement : oTableModel.oData[j].NumOfIncrement * oTableModel.oData[j].LicenseFeePerIncrement;
		              			oTableModel.oData[j].ProtectPricingFlag = obj.data[i][12].toLowerCase() === 'x' ? "true" : "false";
		              			// if ( String(obj.data[i][4],10).length === 1 )
		              			// 	oTableModel.oData[j].PeriodID = "0" + String(obj.data[i][4],10);
		              			// else
		              			// 	oTableModel.oData[j].PeriodID = String(obj.data[i][4],10);
		              			oTableModel.oData[j].PeriodID = ("00" + String(obj.data[i][4],10)).substr(-2,2);
								oTableModel.oData[j].RoyaltyCatg = String(obj.data[i][5],10);
								var RoyaltyCatgHelp = that.getView().getModel('RoyaltyCatg');
								for(var k = 0; k < RoyaltyCatgHelp.oData.length; k++){
									var catExcel = String(obj.data[i][5],10);
									catExcel = catExcel.toUpperCase();
									var catSrhHelp = RoyaltyCatgHelp.oData[k].RoyCat;
									catSrhHelp = catSrhHelp.toUpperCase();
									if( catExcel === catSrhHelp ){
										oTableModel.oData[j].RoyaltyCatg = RoyaltyCatgHelp.oData[k].RoyCat;
									}
								}
								
		              			oTableModel.oData[j].DealChanged = "true";
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
		this.getView().setModel(new JSONModel(this.getOwnerComponent().getModel("userFormatting")), "userFormatting");
		var test = this.getView().getModel("userFormatting");
		
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
        
		var userData = this.getOwnerComponent().getModel("userFormatting");
		oColumns[10].mAggregations.template.mBindingInfos.value.type.oOutputFormat.oFormatOptions.decimalSeparator = userData.oData.DecSep;
		oColumns[10].mAggregations.template.mBindingInfos.value.type.oOutputFormat.oFormatOptions.groupingSeparator = userData.oData.GrpSep;
		oColumns[13].mAggregations.template.mBindingInfos.text.type.oOutputFormat.oFormatOptions.decimalSeparator = userData.oData.DecSep;
		oColumns[13].mAggregations.template.mBindingInfos.text.type.oOutputFormat.oFormatOptions.groupingSeparator = userData.oData.GrpSep;
        for( var i = 0 ; i < oColumns.length ; i++){

            this._oTable.addColumn(oColumns[i]);
        }
        
        // Set Date Format
        var dateFormat = userData.oData.DateFormat;
		dateFormat = dateFormat.replace(/D/g, 'd');
		dateFormat = dateFormat.replace(/Y/g, 'y');
		this.getView().byId("dpValidFromLF").setDisplayFormat(dateFormat);
        this.getView().byId("dpValidToLF").setDisplayFormat(dateFormat);
        
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

    CustomController.prototype._rebindTable = function (oChanges) {
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
                		oData.results[i].PeriodText = that._getPeriodText(oData.results[i].PeriodID);
                		oData.results[i].CatText = that._getCatText(oData.results[i].RoyaltyCatg);
                		oData.results[i].ScopeID = parseInt(oData.results[i].ScopeID, 10);
                		oData.results[i].LicenseFeePerIncrement = parseFloat(oData.results[i].LicenseFeePerIncrement);
                	//	oData.results[i].LicenseFeePerIncrement = oNumberFormat.format(oData.results[i].LicenseFeePerIncrement);
                		oData.results[i].NumOfIncrement = parseInt(oData.results[i].NumOfIncrement, 10);
                		oData.results[i].TotalLicenseFee = parseFloat(oData.results[i].TotalLicenseFee);
            		// 	oData.results[i].TotalLicenseFee = oNumberFormat.format(oData.results[i].TotalLicenseFee);
            			oData.results[i].ProtectPricingFlagFil = oData.results[i].ProtectPricingFlag.toLowerCase() === 'x' ? "true" : "false";
                	}
                	
                	var rowCount = oData.results.length;
                	that._oTable.setTitle("Licensee Fee (" + rowCount + ")");
                    that.getView().getModel("oTableModel").setData(oData.results);
                    that.getView().setModel(new JSONModel({RowCount: rowCount }), "oLFCount");
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
/*    	var oTableModel = this.getView().getModel("oTableModel");
    	oTableModel.refresh(); */
    	
		var index = oEvent.getSource().getParent().getBindingContext("oTableModel").getPath().substr(1); 
		this.getView().getModel("oTableModel").oData[index].DealChanged = "true";
		
		if( oEvent.getSource().sId.search("PeriodCombo") !== -1 ){
			this.getView().getModel("oTableModel").oData[index].PeriodText = oEvent.getSource().mProperties.value;
		}
		if( oEvent.getSource().sId.search("RoyaltyCombo") !== -1 ){
			this.getView().getModel("oTableModel").oData[index].CatText = oEvent.getSource().mProperties.value;
		}
    };
    
    CustomController.prototype.selectRowLFInc = function (oEvent) {
    	var oTableModel = this.getView().getModel("oTableModel");
		var index = oEvent.getSource().getParent().getBindingContext("oTableModel").getPath().substr(1);
		
		// Get LF Per Increment Input Field Value
		var lfVal = parseFloat((oEvent.getParameter("value")).replace(/,/g, ''));
		//this.getView().byId("inpLicInc").setValue(lfVal);
		//this.getView().getModel("oTableModel").oData[index].LicenseFeePerIncrement = lfVal;
		
		this.getView().getModel("oTableModel").oData[index].DealChanged = "true";
		if ( this.getView().getModel("oTableModel").oData[index].NumOfIncrement !== 0 ) {
			this.getView().getModel("oTableModel").oData[index].TotalLicenseFee 
			= lfVal * this.getView().getModel("oTableModel").oData[index].NumOfIncrement  ;
		} else {
			this.getView().getModel("oTableModel").oData[index].TotalLicenseFee = lfVal;
		}
		oTableModel.refresh();
    };
    
    CustomController.prototype.selectRowNumInc = function (oEvent) {
    	var oTableModel = this.getView().getModel("oTableModel");
		var index = oEvent.getSource().getParent().getBindingContext("oTableModel").getPath().substr(1);
		
		// Get Number of Increment Input Field Value
		var numIncVal = parseInt(oEvent.getParameter("value"));
		this.getView().getModel("oTableModel").oData[index].NumOfIncrement = numIncVal;
		
		this.getView().getModel("oTableModel").oData[index].DealChanged = "true";
		if ( numIncVal !== 0 ) {
			this.getView().getModel("oTableModel").oData[index].TotalLicenseFee 
			= this.getView().getModel("oTableModel").oData[index].LicenseFeePerIncrement * numIncVal;
		} else {
			this.getView().getModel("oTableModel").oData[index].TotalLicenseFee = 
				this.getView().getModel("oTableModel").oData[index].LicenseFeePerIncrement;
		}
		oTableModel.refresh();
    };
 
    return CustomController;
});