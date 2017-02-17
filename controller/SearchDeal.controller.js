sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageBox"
], function(Controller, JSONModel) {
	"use strict";

	return Controller.extend("wb.cosmos.dealapp.controller.SearchDeal", {

		onInit: function() {
			var SearchHelpModel;
			var currView = this.getView();
			this.getOwnerComponent().getModel("RepTerSearchHelp").setSizeLimit(800);
			this.getOwnerComponent().getModel("TarCurrSearchHelp").setSizeLimit(800);
			currView.setModel(this.getOwnerComponent().getModel("userFormatting"),"userFormatting");
			
			// this.byId("dateDealWhereEnd").setDisplayFormat(currView.getModel("userFormatting").oData.DateFormat);
			// this.byId("dateDealLastChanged").setDisplayFormat(currView.getModel("userFormatting").oData.DateFormat);
			// this.byId("dateDealCreatedOn").setDisplayFormat(currView.getModel("userFormatting").oData.DateFormat);
			console.log("onInit");
			var dateFormat = currView.getModel("userFormatting").oData.DateFormat;
			dateFormat = dateFormat.replace(/D/g, 'd');
			dateFormat = dateFormat.replace(/Y/g, 'y');
			this.byId("dateDealWhereEnd").setDisplayFormat(dateFormat);
			this.byId("dateDealLastChanged").setDisplayFormat(dateFormat);
			this.byId("dateDealCreatedOn").setDisplayFormat(dateFormat);
		
			// SearchHelpModel = this.getOwnerComponent().getModel("SOSearchHelp");
			// sap.ui.getCore().setModel(SearchHelpModel,"mainModel");
			
			var aURL = "/sap/bc/zxsjs_proxy?cmd=getDivDistCC";
			// var aURL = "/sap/bc/zxsjs_proxy?cmd=checkDealID&DealIds="+DealIds+"&SalesOffices="+SalesOffices;
						
			SearchHelpModel = new sap.ui.model.json.JSONModel();  
			SearchHelpModel.loadData(aURL, null, false, "GET", false, false, null);
			sap.ui.getCore().setModel(SearchHelpModel,"mainModel");
			
			// SearchHelpModel.attachRequestCompleted(function() {
			var masterArray = JSON.parse(SearchHelpModel.getJSON());
			
		// console.log("request completed");
			// Removing Duplicates for Sales Office
			var salesOffice = JSON.parse(SearchHelpModel.getJSON());
			salesOffice.DATA.length = 0;
			var add = false;
			for (var i = 0; i < masterArray.DATA.length; i++) {
				add = true;
				for (var j = 0; j < salesOffice.DATA.length; j++) {
					if ( masterArray.DATA[i].FIELD1 === salesOffice.DATA[j].FIELD1 ){
						add = false;
					}
				}
				if(add){
					salesOffice.DATA[salesOffice.DATA.length] =  masterArray.DATA[i];
				}
			}
			var salesOfficeModel = new JSONModel(salesOffice);
			currView.setModel(salesOfficeModel,"salesOffice");
			sap.ui.getCore().setModel(salesOfficeModel,"salesOfficeModel");
			
			// Removing Duplicates for Company Code
			var compCode = JSON.parse(SearchHelpModel.getJSON());
			compCode.DATA.length = 0;
			var add = false;
			for (var i = 0; i < masterArray.DATA.length; i++) {
				add = true;
				if ( masterArray.DATA[i].FIELD3 === "null" || masterArray.DATA[i].FIELD4 === "null" ) {
					add = false;
				} else {
					for (var j = 0; j < compCode.DATA.length; j++) {
						if ( masterArray.DATA[i].FIELD3 === compCode.DATA[j].FIELD3 ){
							add = false;
						}
					}
				}
				if(add){
					compCode.DATA[compCode.DATA.length] =  masterArray.DATA[i];
				}
			}
			var compCodeModel = new JSONModel(compCode);
			currView.setModel(compCodeModel,"compCode");
			
			// Removing Duplicates for Distribution Channel
			var distChannel = JSON.parse(SearchHelpModel.getJSON());
			distChannel.DATA.length = 0;
			var add = false;
			for (var i = 0; i < masterArray.DATA.length; i++) {
				add = true;
				if ( masterArray.DATA[i].FIELD5 === "null" || masterArray.DATA[i].FIELD6 === "null" ) {
					add = false;
				} else {
					for (var j = 0; j < distChannel.DATA.length; j++) {
						if ( masterArray.DATA[i].FIELD5 === distChannel.DATA[j].FIELD5 ){
							add = false;
						}
					}
				}
				if(add){
					distChannel.DATA[distChannel.DATA.length] =  masterArray.DATA[i];
				}
			}
			var distChannelModel = new JSONModel(distChannel);
			currView.setModel(distChannelModel,"distChannel");
			
			// Removing Duplicates for Division
			var division = JSON.parse(SearchHelpModel.getJSON());
			division.DATA.length = 0;
			var add = false;
			for (var i = 0; i < masterArray.DATA.length; i++) {
				add = true;
				if ( masterArray.DATA[i].FIELD7 === "null" || masterArray.DATA[i].FIELD8 === "null" ) {
					add = false;
				} else {
					for (var j = 0; j < division.DATA.length; j++) {
						if ( masterArray.DATA[i].FIELD7 === division.DATA[j].FIELD7 ){
							add = false;
						}
					}
				}
				if(add){
					division.DATA[division.DATA.length] =  masterArray.DATA[i];
				}
			}
			var divisionModel = new JSONModel(division);
			currView.setModel(divisionModel,"division"); 
				
			// });
			
			// Populate Years
			var oCurrentQuaterYear 	= new Date();
	        var oCurrentYear 		= oCurrentQuaterYear.getFullYear();
	        oCurrentYear 			= oCurrentYear - 5;
	        var oComboYears = this.getView().byId("comboYears");
	        
	        for (var i=0;i<10;i++) {
	        	oComboYears.addItem(new sap.ui.core.ListItem({   //oCurrentYear, 
	    	    	key: oCurrentYear,
	    	    	text: oCurrentYear
	    	      })
	        	);
	        	oCurrentYear = oCurrentYear + 1;
	        }
	        
	        // IP Filter
	        var oIP = this.getView().byId("multiIP");
	        oIP.setFilterFunction(function(sTerm, oItem) {
		      return oItem.getText().match(new RegExp(sTerm, "i"));
			});
			
			// Deal ID Filter
	        var oDealID = this.getView().byId("multiDealID");
	        oDealID.setFilterFunction(function(sTerm, oItem) {
		      return oItem.getText().match(new RegExp(sTerm, "i"));
			});
			oDealID.addValidator(function(args){
				var text = args.text;
				return new sap.m.Token({key:text, text:text});
			});
			
			// Change Order ID Filter
	        var oChangeOrderID = this.getView().byId("multiChangeOrderID");
	        oChangeOrderID.setFilterFunction(function(sTerm, oItem) {
		      return oItem.getText().match(new RegExp(sTerm, "i"));
			});
			oChangeOrderID.addValidator(function(args){
				var text = args.text;
				return new sap.m.Token({key:text, text:text});
			});
	        
	        // Licensee Filter
	        var oLicensee = this.getView().byId("multiLicensee");
	        oLicensee.setFilterFunction(function(sTerm, oItem) {
		      return oItem.getText().match(new RegExp(sTerm, "i"));
			});
			
			// Employee Responsible Filter
	        var oEmpResp = this.getView().byId("multiEmpResp");
	        oEmpResp.setFilterFunction(function(sTerm, oItem) {
		      return oItem.getText().match(new RegExp(sTerm, "i"));
			});
			
			// Sales Executive Filter
	        var oSalesExec = this.getView().byId("multiSalesExec");
	        oSalesExec.setFilterFunction(function(sTerm, oItem) {
		      return oItem.getText().match(new RegExp(sTerm, "i"));
			});
			
			// Contract Admin Filter
	        var oContAdmin = this.getView().byId("multiContAdmin");
	        oContAdmin.setFilterFunction(function(sTerm, oItem) {
		      return oItem.getText().match(new RegExp(sTerm, "i"));
			});
			
			// Contract Manager Filter
	        var oContManag = this.getView().byId("multiContManag");
	        oContManag.setFilterFunction(function(sTerm, oItem) {
		      return oItem.getText().match(new RegExp(sTerm, "i"));
			});
	        
		},
		
		onAfterRendering: function() {
			setQuarter(this);		
			
			this.getView().byId("dateDealWhereEnd").setValue(yyyymmdd(new Date(),"today"));
			this.getView().byId("dateDealWhereEnd").setEnabled(true);
			
			this.getView().byId("checkDealWhereEnd").setSelected(true);		// Default enable checkbox
			this.getView().byId("dateDealLastChanged").setValue(yyyymmdd(new Date(),"quarterstart"));
			// this.getView().byId("dateRevenueRecog").setEnabled(false);
			// Changed by Divyata on 06122015
			// this.getView().byId("checkStatusTBA").setEnabled(true);
			this.getView().byId("dateDealCreatedOn").setEnabled(false);
			this.getView().byId("comboQuarter").setEnabled(false);
			this.getView().byId("comboYears").setEnabled(false);
			this.getView().byId("dateDealLastChanged").setEnabled(false);	
		},
		
		/**
		 * This function is used to perform operations based on Deals Radio button selection.
		 */
		onDealSelection: function() {
			
			if ( this.getView().byId("checkDealWhereEnd").getSelected() === true ) {
				this.getView().byId("dateDealWhereEnd").setEnabled(true);
			} else if ( this.getView().byId("checkDealWhereEnd").getSelected() === false ) {
				this.getView().byId("dateDealWhereEnd").setEnabled(false);
			}
			 
			if ( this.getView().byId("checkLicenseActiveQuarter").getSelected() === true ) {
				this.getView().byId("comboQuarter").setEnabled(true);
				this.getView().byId("comboYears").setEnabled(true);
			} else if ( this.getView().byId("checkLicenseActiveQuarter").getSelected() === false ) {
				this.getView().byId("comboQuarter").setEnabled(false);
				this.getView().byId("comboYears").setEnabled(false);
			}
			 
			if ( this.getView().byId("checkDealLastChanged").getSelected() === true ) {
				this.getView().byId("dateDealLastChanged").setEnabled(true);
			} else if ( this.getView().byId("checkDealLastChanged").getSelected() === false ) {
				this.getView().byId("dateDealLastChanged").setEnabled(false);
			}
			 
			// if ( this.getView().byId("checkRevRecDate").getSelected() === true ) {
			// 	this.getView().byId("dateRevenueRecog").setEnabled(true);
			// } else if ( this.getView().byId("checkRevRecDate").getSelected() === false ) {
			// 	this.getView().byId("dateRevenueRecog").setEnabled(false);
			// } 
			 
			if ( this.getView().byId("checkDealCreatedOn").getSelected() === true ) {
				this.getView().byId("dateDealCreatedOn").setEnabled(true);
			} else if (  this.getView().byId("checkDealCreatedOn").getSelected() === false ) {
				this.getView().byId("dateDealCreatedOn").setEnabled(false);
			}
		},
		
		loadIP: function (oEvent) {
			var gSearchParam 	= oEvent.getParameter("suggestValue");
			var SearchParam 	= "";
			var seperator = ";";
		    if (gSearchParam.lastIndexOf(seperator) >= 0){
		        SearchParam 	= gSearchParam.substr(gSearchParam.lastIndexOf(seperator)+1,gSearchParam.length);
		    } else {
		    	 SearchParam 	= gSearchParam;
		    }
		    
			var aURL = '/sap/bc/zxsjs_proxy?cmd=getIP&IP='+SearchParam;
			
			var oIP = this.getView().byId("multiIP");
			var oModel = new sap.ui.model.json.JSONModel();  
			oModel.loadData(aURL, null, false, "GET", false, false, null);
			oIP.setModel(oModel);
			oIP.bindAggregation("suggestionItems", "/", new sap.ui.core.Item({text: "{terms}"}));
		},
		
		loadDealID: function (oEvent) {
			var gSearchParam 	= oEvent.getParameter("suggestValue");
			var SearchParam 	= "";
			// var seperator = ";";
		 //   if (gSearchParam.lastIndexOf(seperator) >= 0){
		 //       SearchParam 	= gSearchParam.substr(gSearchParam.lastIndexOf(seperator)+1,gSearchParam.length);
		 //   } else {
		 //   	 SearchParam 	= gSearchParam;
		 //   }
		    
		    // SearchParam = SearchParam.trim();
		    SearchParam = gSearchParam;
			var aURL = '/sap/bc/zxsjs_proxy?cmd=getDealID&DealID='+SearchParam;
			
/*			// Appending SalesOffice to the search URL
			// Get selected Sales Office if any
			
			var salesOffice = this.getView().byId("comboSalesOff").getSelectedKeys();
			// Get Sales Office model if none selected
			var salesOfficeModel = sap.ui.getCore().getModel("salesOfficeModel");
			var salesOfficeArray = JSON.parse(salesOfficeModel.getJSON());
			
			var salesOfficeStr = "&SalesOffice=";
			if (salesOffice.length > 0) {
				for (var i=0;i<salesOffice.length;i++) {
					if (i===0)
						salesOfficeStr = salesOfficeStr + salesOffice[i].trim();
					else
						salesOfficeStr = salesOfficeStr + "," + salesOffice[i].trim();
				}
			} else {
				for (var j=0;j<salesOfficeArray.DATA.length;j++) {
					if (j===0)
						salesOfficeStr = salesOfficeStr + salesOfficeArray.DATA[j].FIELD1.trim();
					else
						salesOfficeStr = salesOfficeStr + "," + salesOfficeArray.DATA[j].FIELD1.trim();
				}
			} 
			
			// Appending to final URL
			aURL = aURL + salesOfficeStr; */
			
/*			jQuery.ajax({
		    	
	    		url: aURL,
	    		method: 'GET',
	    		dataType:'json',
	    		success: onLoadDealID
	    	}); */
			
			var oDealID = this.getView().byId("multiDealID");
			var oModel = new sap.ui.model.json.JSONModel();  
			oModel.loadData(aURL, null, false, "GET", false, false, null);
			oDealID.setModel(oModel);
			oDealID.bindAggregation("suggestionItems", "/", new sap.ui.core.Item({text: "{terms}"})); 
		},
		
		loadChangeOrderID: function (oEvent) {
			var gSearchParam 	= oEvent.getParameter("suggestValue");
			var SearchParam 	= "";
			// var seperator = ";";
		 //   if (gSearchParam.lastIndexOf(seperator) >= 0){
		 //       SearchParam 	= gSearchParam.substr(gSearchParam.lastIndexOf(seperator)+1,gSearchParam.length);
		 //   } else {
		 //   	 SearchParam 	= gSearchParam;
		 //   }
		    
		    //SearchParam = SearchParam.trim();
		    SearchParam = gSearchParam;
			var aURL = '/sap/bc/zxsjs_proxy?cmd=getChangeOrderID&ChangeOrderID='+SearchParam;
			
/*			// Appending SalesOffice to the search URL
			// Get selected Sales Office if any
			
			var salesOffice = this.getView().byId("comboSalesOff").getSelectedKeys();
			// Get Sales Office model if none selected
			var salesOfficeModel = sap.ui.getCore().getModel("salesOfficeModel");
			var salesOfficeArray = JSON.parse(salesOfficeModel.getJSON());
			
			var salesOfficeStr = "&SalesOffice=";
			if (salesOffice.length > 0) {
				for (var i=0;i<salesOffice.length;i++) {
					if (i===0)
						salesOfficeStr = salesOfficeStr + salesOffice[i].trim();
					else
						salesOfficeStr = salesOfficeStr + "," + salesOffice[i].trim();
				}
			} else {
				for (var j=0;j<salesOfficeArray.DATA.length;j++) {
					if (j===0)
						salesOfficeStr = salesOfficeStr + salesOfficeArray.DATA[j].FIELD1.trim();
					else
						salesOfficeStr = salesOfficeStr + "," + salesOfficeArray.DATA[j].FIELD1.trim();
				}
			}
			
			// Appending to final URL
			aURL = aURL + salesOfficeStr; */
			
			var oChangeOrderID = this.getView().byId("multiChangeOrderID");
			var oModel = new sap.ui.model.json.JSONModel();  
			oModel.loadData(aURL, null, false, "GET", false, false, null);
			oChangeOrderID.setModel(oModel);
			oChangeOrderID.bindAggregation("suggestionItems", "/", new sap.ui.core.Item({text: "{terms}"}));
		},
		
		loadLicensee: function (oEvent) {
			var gSearchParam 	= oEvent.getParameter("suggestValue");
			var SearchParam 	= "";
			var seperator = ";";
		    if (gSearchParam.lastIndexOf(seperator) >= 0){
		        SearchParam 	= gSearchParam.substr(gSearchParam.lastIndexOf(seperator)+1,gSearchParam.length);
		    } else {
		    	 SearchParam 	= gSearchParam;
		    }
		    
			var aURL = '/sap/bc/zxsjs_proxy?cmd=getLicensee&Licensee='+SearchParam;
			
			var oLicensee = this.getView().byId("multiLicensee");
			var oModel = new sap.ui.model.json.JSONModel();  
			oModel.loadData(aURL, null, false, "GET", false, false, null);
//			oModel.setData(myJSON);
			oLicensee.setModel(oModel);
			oLicensee.bindAggregation("suggestionItems", "/", new sap.ui.core.Item({text: "{terms}"}));
	
/*			var aURL = '/sap/bc/zxsjs_proxy?cmd=getLicensee&Licensee='+SearchParam;
			jQuery.ajax({
		    	
	    		url: aURL,
	    		method: 'GET',
	    		dataType:'json',
	    		success: onLoadLicensee
	    	});  */
	    	
		},
		
		loadEmpResp: function (oEvent) {
			var gSearchParam 	= oEvent.getParameter("suggestValue");
			var SearchParam 	= "";
			var seperator = ";";
		    if (gSearchParam.lastIndexOf(seperator) >= 0){
		        SearchParam 	= gSearchParam.substr(gSearchParam.lastIndexOf(seperator)+1,gSearchParam.length);
		    } else {
		    	 SearchParam 	= gSearchParam;
		    }
		    
			var aURL = '/sap/bc/zxsjs_proxy?cmd=getEmpResp&EmployeeResponsible='+SearchParam;
			
			var oEmpResp = this.getView().byId("multiEmpResp");
			var oModel = new sap.ui.model.json.JSONModel();  
			oModel.loadData(aURL, null, false, "GET", false, false, null);
			oEmpResp.setModel(oModel);
			oEmpResp.bindAggregation("suggestionItems", "/", new sap.ui.core.Item({text: "{terms}"}));
		},
		
		loadSalesExec: function (oEvent) {
			var gSearchParam 	= oEvent.getParameter("suggestValue");
			var SearchParam 	= "";
			var seperator = ";";
		    if (gSearchParam.lastIndexOf(seperator) >= 0){
		        SearchParam 	= gSearchParam.substr(gSearchParam.lastIndexOf(seperator)+1,gSearchParam.length);
		    } else {
		    	 SearchParam 	= gSearchParam;
		    }
		    
			var aURL = '/sap/bc/zxsjs_proxy?cmd=getSalesExec&SalesExecutive='+SearchParam;
			
			var oSalesExec = this.getView().byId("multiSalesExec")
			var oModel = new sap.ui.model.json.JSONModel();  
			oModel.loadData(aURL, null, false, "GET", false, false, null);
			oSalesExec.setModel(oModel);
			oSalesExec.bindAggregation("suggestionItems", "/", new sap.ui.core.Item({text: "{terms}"}));
		},
		
		loadContAdmin: function (oEvent) {
			var gSearchParam 	= oEvent.getParameter("suggestValue");
			var SearchParam 	= "";
			var seperator = ";";
		    if (gSearchParam.lastIndexOf(seperator) >= 0){
		        SearchParam 	= gSearchParam.substr(gSearchParam.lastIndexOf(seperator)+1,gSearchParam.length);
		    } else {
		    	 SearchParam 	= gSearchParam;
		    }
		    
			var aURL = '/sap/bc/zxsjs_proxy?cmd=getContAdmin&ContractAdminAssigned='+SearchParam;
			
			var oContAdmin = this.getView().byId("multiContAdmin");
			var oModel = new sap.ui.model.json.JSONModel();  
			oModel.loadData(aURL, null, false, "GET", false, false, null);
			oContAdmin.setModel(oModel);
			oContAdmin.bindAggregation("suggestionItems", "/", new sap.ui.core.Item({text: "{terms}"}));
		},
		
		loadContManag: function (oEvent) {
			var gSearchParam 	= oEvent.getParameter("suggestValue");
			var SearchParam 	= "";
			var seperator = ";";
		    if (gSearchParam.lastIndexOf(seperator) >= 0){
		        SearchParam 	= gSearchParam.substr(gSearchParam.lastIndexOf(seperator)+1,gSearchParam.length);
		    } else {
		    	 SearchParam 	= gSearchParam;
		    }
		    
			var aURL = '/sap/bc/zxsjs_proxy?cmd=getContManag&ContractManagerAssigned='+SearchParam;
			
			var oContManag = this.getView().byId("multiContManag");
			var oModel = new sap.ui.model.json.JSONModel();  
			oModel.loadData(aURL, null, false, "GET", false, false, null);
			oContManag.setModel(oModel);
			oContManag.bindAggregation("suggestionItems", "/", new sap.ui.core.Item({text: "{terms}"}));
		},
		
		handleSelectionFinish: function(oEvent) {
			if (oEvent.getParameters().selectedItems.length > 0) {
				var currView = this.getView();
				//var SearchHelpModel = this.getOwnerComponent().getModel("SOSearchHelp");
				var SearchHelpModel = sap.ui.getCore().getModel("mainModel");
				//SearchHelpModel.attachRequestCompleted(function() {
					
					var masterArray = JSON.parse(SearchHelpModel.getJSON());
					
					// Get Selected Sales Office
					var oSalesOfficesSelected 		= oEvent.getParameters().selectedItems;
					
					// Filter all other fields
					
					var compCode = JSON.parse(SearchHelpModel.getJSON());
					compCode.DATA.length = 0;
					var distChannel = JSON.parse(SearchHelpModel.getJSON());
					distChannel.DATA.length = 0;
					var division = JSON.parse(SearchHelpModel.getJSON());
					division.DATA.length = 0;
					
					var add = false;
					if (oSalesOfficesSelected.length > 0) {
						for (var j=0;j<oSalesOfficesSelected.length;j++) {
							for (var i=0;i<masterArray.DATA.length;i++) {
								if(masterArray.DATA[i].FIELD1 === oSalesOfficesSelected[j].getKey()) {
									// Check for duplicacy before adding
									
									// Company Code
									add = true;
									for (var k=0;k<compCode.DATA.length;k++) {
										if ( masterArray.DATA[i].FIELD3 === compCode.DATA[k].FIELD3 ) {
											add = false; 
										}
									}
									if(add) {
										compCode.DATA[compCode.DATA.length] =  masterArray.DATA[i];
									}
									
									// Distribution Channel
									add = true;
									for (var k=0;k<distChannel.DATA.length;k++) {
										if ( masterArray.DATA[i].FIELD5 === distChannel.DATA[k].FIELD5 ) {
											add = false; 
										}
									}
									if(add) {
										distChannel.DATA[distChannel.DATA.length] =  masterArray.DATA[i];
									}
									
									// Division
									add = true;
									for (var k=0;k<division.DATA.length;k++) {
										if ( masterArray.DATA[i].FIELD7 === division.DATA[k].FIELD7 ) {
											add = false; 
										}
									}
									if(add) {
										division.DATA[division.DATA.length] =  masterArray.DATA[i];
									}
								}
							}
						}
						
						// Check the Deal Id's against selected Sales Office(s)
						var SalesOffices = "";
						var DealIds = "";
						var dealIdUI = this.getView().byId("multiDealID")
						
						if (this.getView().byId("multiDealID").getTokens().length > 0) {
							DealIds = getTokIDs(dealIdUI.getTokens());
							DealIds = DealIds.replace(/;/g,',');
							
							for (var i=0;i<oSalesOfficesSelected.length;i++) {
								SalesOffices = SalesOffices + oSalesOfficesSelected[i].getKey().trim() + ',';
							}
							SalesOffices = SalesOffices.slice(0,-1);
							
							var aURL = "/sap/bc/zxsjs_proxy?cmd=checkDealID&DealIds="+DealIds+"&SalesOffices="+SalesOffices;
							
							var oModel = new sap.ui.model.json.JSONModel();  
							oModel.loadData(aURL, null, false, "GET", false, false, null);
							
							var dealIds = JSON.parse(oModel.getJSON());
							var dealIdTokens = dealIdUI.getTokens();
							var dealIdTokenKey= [];
							for (var j=0;j<dealIdTokens.length;j++) {
								dealIdTokenKey = dealIdTokens[j].getText().split("|");
								if(dealIds.indexOf(dealIdTokenKey[1].trim()) < 0) {
									dealIdUI.removeToken(dealIdTokens[j]);
								}
							}
						}
						
						// Check the Change Order Id's against selected Sales Office(s)
						var SalesOffices = "";
						var ChangeOrderIds = "";
						
						var CoIdUI = this.getView().byId("multiChangeOrderID");
						
						if (this.getView().byId("multiChangeOrderID").getTokens().length > 0) {
							ChangeOrderIds = getTokIDs(CoIdUI.getTokens());
							ChangeOrderIds = ChangeOrderIds.replace(/;/g,',');
							
							for (var i=0;i<oSalesOfficesSelected.length;i++) {
								SalesOffices = SalesOffices + oSalesOfficesSelected[i].getKey().trim() + ',';
							}
							SalesOffices = SalesOffices.slice(0,-1);
							
							var aURL = "/sap/bc/zxsjs_proxy?cmd=checkChangeOrderID&ChangeOrderIds="+ChangeOrderIds+"&SalesOffices="+SalesOffices;
							
							var oModel = new sap.ui.model.json.JSONModel();  
							oModel.loadData(aURL, null, false, "GET", false, false, null);
							
							var changeOrderIds = JSON.parse(oModel.getJSON());
							var changeOrderIdTokens = dealIdUI.getTokens();
							var changeOrderIdTokenKey= [];
							for (var j=0;j<changeOrderIdTokens.length;j++) {
								changeOrderIdTokenKey = changeOrderIdTokens[j].getText().split("|");
								if(dealIds.indexOf(changeOrderIdTokenKey[1].trim()) < 0) {
									CoIdUI.removeToken(changeOrderIdTokens[j]);
								}
							}
						}
						
						
					} else {
						for (var i=0;i<masterArray.DATA.length;i++) {
							// Company Code
							add = true;
							for (var k=0;k<compCode.DATA.length;k++) {
								if ( masterArray.DATA[i].FIELD3 === compCode.DATA[k].FIELD3 ||
									 masterArray.DATA[i].FIELD3 === "null" || masterArray.DATA[i].FIELD4 === "null" ) {
									add = false; 
								}
							}
							if(add) {
								compCode.DATA[compCode.DATA.length] =  masterArray.DATA[i];
							}
							
							// Distribution Channel
							add = true;
							for (var k=0;k<distChannel.DATA.length;k++) {
								if ( masterArray.DATA[i].FIELD5 === distChannel.DATA[k].FIELD5 || 
									 masterArray.DATA[i].FIELD5 === "null" || masterArray.DATA[i].FIELD6 === "null" ) {
									add = false; 
								}
							}
							if(add) {
								distChannel.DATA[distChannel.DATA.length] =  masterArray.DATA[i];
							}
							
							// Division
							add = true;
							for (var k=0;k<division.DATA.length;k++) {
								if ( masterArray.DATA[i].FIELD7 === division.DATA[k].FIELD7 || 
									 masterArray.DATA[i].FIELD7 === "null" || masterArray.DATA[i].FIELD8 === "null" ) {
									add = false; 
								}
							}
							if(add) {
								division.DATA[division.DATA.length] =  masterArray.DATA[i];
							}
						}
					}
					
/*					for (var i=0;i<masterArray.DATA.length;i++) {
						add = true;
						// If any Sales Office is selected
						if (oSalesOfficesSelected.length > 0) {
							for (var j=0;j<oSalesOfficesSelected.length;j++) {
								if(masterArray.DATA[i].FIELD1 === oSalesOfficesSelected[j].getKey()) {
									// Check for duplicacy before adding
									
									// Company Code
									add = true;
									for (var k=0;k<compCode.DATA.length;k++) {
										if ( masterArray.DATA[i].FIELD3 === compCode.DATA[k].FIELD3 ) {
											add = false; 
										}
									}
									if(add) {
										compCode.DATA[compCode.DATA.length] =  masterArray.DATA[i];
									}
									
									// Distribution Channel
									add = true;
									for (var k=0;k<distChannel.DATA.length;k++) {
										if ( masterArray.DATA[i].FIELD5 === distChannel.DATA[k].FIELD5 ) {
											add = false; 
										}
									}
									if(add) {
										distChannel.DATA[distChannel.DATA.length] =  masterArray.DATA[i];
									}
									
									// Division
									add = true;
									for (var k=0;k<division.DATA.length;k++) {
										if ( masterArray.DATA[i].FIELD5 === division.DATA[k].FIELD5 ) {
											add = false; 
										}
									}
									if(add) {
										division.DATA[division.DATA.length] =  masterArray.DATA[i];
									}
									
								}
							}
						} else {
							// Company Code
							add = true;
							for (var k=0;k<compCode.DATA.length;k++) {
								if ( masterArray.DATA[i].FIELD3 === compCode.DATA[k].FIELD3 ) {
									add = false; 
								}
							}
							if(add) {
								compCode.DATA[compCode.DATA.length] =  masterArray.DATA[i];
							}
							
							// Distribution Channel
							add = true;
							for (var k=0;k<distChannel.DATA.length;k++) {
								if ( masterArray.DATA[i].FIELD5 === distChannel.DATA[k].FIELD5 ) {
									add = false; 
								}
							}
							if(add) {
								distChannel.DATA[distChannel.DATA.length] =  masterArray.DATA[i];
							}
							
							// Division
							add = true;
							for (var k=0;k<division.DATA.length;k++) {
								if ( masterArray.DATA[i].FIELD7 === division.DATA[k].FIELD7 ) {
									add = false; 
								}
							}
							if(add) {
								division.DATA[division.DATA.length] =  masterArray.DATA[i];
							}
						}
					} */
					
					// Mapping back to the screen models
					var compCodeModel = new JSONModel(compCode);
					currView.setModel(compCodeModel,"compCode");
					
					var distChannelModel = new JSONModel(distChannel);
					currView.setModel(distChannelModel,"distChannel");
	
					var divisionModel = new JSONModel(division);
					currView.setModel(divisionModel,"division");
				//});
			}
		},
		
		handleSelectionChange: function(oEvent) {
			var currView = this.getView();
			var SearchHelpModel = sap.ui.getCore().getModel("mainModel");
			var masterArray = JSON.parse(SearchHelpModel.getJSON());
			
			var compCode = JSON.parse(SearchHelpModel.getJSON());
			compCode.DATA.length = 0;
			var distChannel = JSON.parse(SearchHelpModel.getJSON());
			distChannel.DATA.length = 0;
			var division = JSON.parse(SearchHelpModel.getJSON());
			division.DATA.length = 0;
			
			// Get Selected Sales Office
		
			var selKeysArr = this.getView().byId("comboSalesOff").getSelectedKeys();
			
			var add = false;
			// If any Sales Office is selected
			if (selKeysArr.length > 0) {
				for (var j=0;j<selKeysArr.length;j++) {
					for (var i=0;i<masterArray.DATA.length;i++) {
						if(masterArray.DATA[i].FIELD1 === selKeysArr[j]) {
							// Check for duplicacy before adding
							
							// Company Code
							add = true;
							for (var k=0;k<compCode.DATA.length;k++) {
								if ( masterArray.DATA[i].FIELD3 === compCode.DATA[k].FIELD3 ) {
									add = false; 
								}
							}
							if(add) {
								compCode.DATA[compCode.DATA.length] =  masterArray.DATA[i];
							}
							
							// Distribution Channel
							add = true;
							for (var k=0;k<distChannel.DATA.length;k++) {
								if ( masterArray.DATA[i].FIELD5 === distChannel.DATA[k].FIELD5 ) {
									add = false; 
								}
							}
							if(add) {
								distChannel.DATA[distChannel.DATA.length] =  masterArray.DATA[i];
							}
							
							// Division
							add = true;
							for (var k=0;k<division.DATA.length;k++) {
								if ( masterArray.DATA[i].FIELD7 === division.DATA[k].FIELD7 ) {
									add = false; 
								}
							}
							if(add) {
								division.DATA[division.DATA.length] =  masterArray.DATA[i];
							}
							
						}
					}
				}
			} else {
				for (var i=0;i<masterArray.DATA.length;i++) {
					// Company Code
					add = true;
					for (var k=0;k<compCode.DATA.length;k++) {
						if ( masterArray.DATA[i].FIELD3 === compCode.DATA[k].FIELD3 || 
							 masterArray.DATA[i].FIELD3 === "null" || masterArray.DATA[i].FIELD4 === "null") {
							add = false; 
						}
					}
					if(add) {
						compCode.DATA[compCode.DATA.length] =  masterArray.DATA[i];
					}
					
					// Distribution Channel
					add = true;
					for (var k=0;k<distChannel.DATA.length;k++) {
						if ( masterArray.DATA[i].FIELD5 === distChannel.DATA[k].FIELD5 ||
							 masterArray.DATA[i].FIELD5 === "null" || masterArray.DATA[i].FIELD6 === "null") {
							add = false; 
						}
					}
					if(add) {
						distChannel.DATA[distChannel.DATA.length] =  masterArray.DATA[i];
					}
					
					// Division
					add = true;
					for (var k=0;k<division.DATA.length;k++) {
						if ( masterArray.DATA[i].FIELD7 === division.DATA[k].FIELD7 ||
							 masterArray.DATA[i].FIELD7 === "null" || masterArray.DATA[i].FIELD8 === "null") {
							add = false; 
						}
					}
					if(add) {
						division.DATA[division.DATA.length] =  masterArray.DATA[i];
					}
				}
			}
			
/*			var add = false;
			for (var i=0;i<masterArray.DATA.length;i++) {
				add = true;
				// If any Sales Office is selected
				if (selKeysArr.length > 0) {
					for (var j=0;j<selKeysArr.length;j++) {
						if(masterArray.DATA[i].FIELD1 === selKeysArr[j]) {
							// Check for duplicacy before adding
							
							// Company Code
							add = true;
							for (var k=0;k<compCode.DATA.length;k++) {
								if ( masterArray.DATA[i].FIELD3 === compCode.DATA[k].FIELD3 ) {
									add = false; 
								}
							}
							if(add) {
								compCode.DATA[compCode.DATA.length] =  masterArray.DATA[i];
							}
							
							// Distribution Channel
							add = true;
							for (var k=0;k<distChannel.DATA.length;k++) {
								if ( masterArray.DATA[i].FIELD5 === distChannel.DATA[k].FIELD5 ) {
									add = false; 
								}
							}
							if(add) {
								distChannel.DATA[distChannel.DATA.length] =  masterArray.DATA[i];
							}
							
							// Division
							add = true;
							for (var k=0;k<division.DATA.length;k++) {
								if ( masterArray.DATA[i].FIELD5 === division.DATA[k].FIELD5 ) {
									add = false; 
								}
							}
							if(add) {
								division.DATA[division.DATA.length] =  masterArray.DATA[i];
							}
							
						}
					}
				} else {
					// Company Code
					add = true;
					for (var k=0;k<compCode.DATA.length;k++) {
						if ( masterArray.DATA[i].FIELD3 === compCode.DATA[k].FIELD3 || 
							 masterArray.DATA[i].FIELD3 === "null" || masterArray.DATA[i].FIELD4 === "null") {
							add = false; 
						}
					}
					if(add) {
						compCode.DATA[compCode.DATA.length] =  masterArray.DATA[i];
					}
					
					// Distribution Channel
					add = true;
					for (var k=0;k<distChannel.DATA.length;k++) {
						if ( masterArray.DATA[i].FIELD5 === distChannel.DATA[k].FIELD5 ||
							 masterArray.DATA[i].FIELD5 === "null" || masterArray.DATA[i].FIELD6 === "null") {
							add = false; 
						}
					}
					if(add) {
						distChannel.DATA[distChannel.DATA.length] =  masterArray.DATA[i];
					}
					
					// Division
					add = true;
					for (var k=0;k<division.DATA.length;k++) {
						if ( masterArray.DATA[i].FIELD7 === division.DATA[k].FIELD7 ||
							 masterArray.DATA[i].FIELD7 === "null" || masterArray.DATA[i].FIELD8 === "null") {
							add = false; 
						}
					}
					if(add) {
						division.DATA[division.DATA.length] =  masterArray.DATA[i];
					}
				}
			} */
			
			// Mapping back to the screen models
			var compCodeModel = new JSONModel(compCode);
			currView.setModel(compCodeModel,"compCode");
			
			var distChannelModel = new JSONModel(distChannel);
			currView.setModel(distChannelModel,"distChannel");

			var divisionModel = new JSONModel(division);
			currView.setModel(divisionModel,"division");
			
			
/*			if (oEvent.getParameters().changedItem.length > 0) {
				var currView = this.getView();
				//var SearchHelpModel = this.getOwnerComponent().getModel("SOSearchHelp");
				var SearchHelpModel = sap.ui.getCore().getModel("mainModel");
				//SearchHelpModel.attachRequestCompleted(function() {
					
				var masterArray = JSON.parse(SearchHelpModel.getJSON());
				
				// Get Selected Sales Office
				var oSalesOfficesSelected 		= oEvent.getParameters().selectedItems;
				
				// Filter all other fields
				var compCode = JSON.parse(SearchHelpModel.getJSON());
				compCode.DATA.length = 0;
				var distChannel = JSON.parse(SearchHelpModel.getJSON());
				distChannel.DATA.length = 0;
				var division = JSON.parse(SearchHelpModel.getJSON());
				division.DATA.length = 0;
				
				var add = false;
				for (var i=0;i<masterArray.DATA.length;i++) {
					add = true;
					// If any Sales Office is selected
					if (oSalesOfficesSelected.length > 0) {
						for (var j=0;j<oSalesOfficesSelected.length;j++) {
							if(masterArray.DATA[i].FIELD1 === oSalesOfficesSelected[j].getKey()) {
								// Check for duplicacy before adding
								
								// Company Code
								add = true;
								for (var k=0;k<compCode.DATA.length;k++) {
									if ( masterArray.DATA[i].FIELD3 === compCode.DATA[k].FIELD3 ) {
										add = false; 
									}
								}
								if(add) {
									compCode.DATA[compCode.DATA.length] =  masterArray.DATA[i];
								}
								
								// Distribution Channel
								add = true;
								for (var k=0;k<distChannel.DATA.length;k++) {
									if ( masterArray.DATA[i].FIELD5 === distChannel.DATA[k].FIELD5 ) {
										add = false; 
									}
								}
								if(add) {
									distChannel.DATA[distChannel.DATA.length] =  masterArray.DATA[i];
								}
								
								// Division
								add = true;
								for (var k=0;k<division.DATA.length;k++) {
									if ( masterArray.DATA[i].FIELD5 === division.DATA[k].FIELD5 ) {
										add = false; 
									}
								}
								if(add) {
									division.DATA[division.DATA.length] =  masterArray.DATA[i];
								}
								
							}
						}
					}
				} 
				// Mapping back to the screen models
				var compCodeModel = new JSONModel(compCode);
				currView.setModel(compCodeModel,"compCode");
				
				var distChannelModel = new JSONModel(distChannel);
				currView.setModel(distChannelModel,"distChannel");
	
				var divisionModel = new JSONModel(division);
				currView.setModel(divisionModel,"division");
			} else {
				// Company Code
				add = true;
				for (var k=0;k<compCode.DATA.length;k++) {
					if ( masterArray.DATA[i].FIELD3 === compCode.DATA[k].FIELD3 ) {
						add = false; 
					}
				}
				if(add) {
					compCode.DATA[compCode.DATA.length] =  masterArray.DATA[i];
				}
				
				// Distribution Channel
				add = true;
				for (var k=0;k<distChannel.DATA.length;k++) {
					if ( masterArray.DATA[i].FIELD5 === distChannel.DATA[k].FIELD5 ) {
						add = false; 
					}
				}
				if(add) {
					distChannel.DATA[distChannel.DATA.length] =  masterArray.DATA[i];
				}
				
				// Division
				add = true;
				for (var k=0;k<division.DATA.length;k++) {
					if ( masterArray.DATA[i].FIELD5 === division.DATA[k].FIELD5 ) {
						add = false; 
					}
				}
				if(add) {
					division.DATA[division.DATA.length] =  masterArray.DATA[i];
				}
			
				// Mapping back to the screen models
				var compCodeModel = new JSONModel(compCode);
				currView.setModel(compCodeModel,"compCode");
				
				var distChannelModel = new JSONModel(distChannel);
				currView.setModel(distChannelModel,"distChannel");
	
				var divisionModel = new JSONModel(division);
				currView.setModel(divisionModel,"division"); */
		},
		
		onExecute1: function() {
				var oModel = new sap.ui.model.json.JSONModel();  
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			var currentView = this;
				oModel.loadData("localService/dealQuery.json");
			oModel.attachRequestCompleted(function() {
				currentView.getOwnerComponent().setModel(oModel, "searchResult");
				oRouter.navTo("masterRoute");
			});
		},
		
		handleSavePress: function() {
				
			this.getView().byId("comboSalesOff").removeAllSelectedItems();
			this.getView().byId("comboSalesOff").setValue("");
			this.getView().byId("multiLicensee").removeAllTokens();
			this.getView().byId("multiLicensee").setValue("");
			this.getView().byId("multiIP").removeAllTokens();
			this.getView().byId("multiIP").setValue("");
			this.getView().byId("multiDealID").removeAllTokens();
			this.getView().byId("multiDealID").setValue("");
			this.getView().byId("comboDealStatus").removeAllSelectedItems();
			this.getView().byId("comboDealStatus").setValue("");
			this.getView().byId("comboCOStatus").removeAllSelectedItems();
			this.getView().byId("comboCOStatus").setValue("");
			this.getView().byId("comboRepTerri").removeAllSelectedItems();
			this.getView().byId("comboRepTerri").setValue("");
			// this.getView().byId("dateRevenueRecog").setValue("");
			this.getView().byId("comboRoyScopeStatus").removeAllSelectedItems();
			this.getView().byId("comboRoyScopeStatus").setValue("");
			this.getView().byId("multiEmpResp").removeAllTokens();
			this.getView().byId("multiEmpResp").setValue("");
			this.getView().byId("multiSalesExec").removeAllTokens();
			this.getView().byId("multiSalesExec").setValue("");
			this.getView().byId("comboCompCode").removeAllSelectedItems();
			this.getView().byId("comboCompCode").setValue("");
			this.getView().byId("comboDistChannel").removeAllSelectedItems();
			this.getView().byId("comboDistChannel").setValue("");
			this.getView().byId("comboDivision").removeAllSelectedItems();
			this.getView().byId("comboDivision").setValue("");
			this.getView().byId("multiChangeOrderID").removeAllTokens();
			this.getView().byId("multiChangeOrderID").setValue("");
			this.getView().byId("comboRepMedia").removeAllSelectedItems();
			this.getView().byId("comboRepMedia").setValue("");
			this.getView().byId("comboTarCurr").removeAllSelectedItems();
			this.getView().byId("comboTarCurr").setValue("");
			this.getView().byId("comboTranType").removeAllSelectedItems();
			this.getView().byId("comboTranType").setValue("");
			this.getView().byId("multiContAdmin").removeAllTokens();
			this.getView().byId("multiContAdmin").setValue("");
			this.getView().byId("multiContManag").removeAllTokens();
			this.getView().byId("multiContManag").setValue("");
			
			this.getView().byId("checkDealWhereEnd").setSelected(true);
			this.getView().byId("checkLicenseActiveQuarter").setSelected(false);
			this.getView().byId("checkDealLastChanged").setSelected(false);
			this.getView().byId("checkDealCreatedOn").setSelected(false);
			
			this.getView().byId("dateDealWhereEnd").setValue(yyyymmdd(new Date(),"today"));
			this.getView().byId("dateDealLastChanged").setValue(yyyymmdd(new Date(),"quarterstart"));
			this.getView().byId("dateDealCreatedOn").setValue("");
			
			this.getView().byId("dateDealWhereEnd").setEnabled(true);	
			this.getView().byId("comboQuarter").setEnabled(false);
			this.getView().byId("comboYears").setEnabled(false);
			this.getView().byId("dateDealLastChanged").setEnabled(false);
			// this.getView().byId("dateRevenueRecog").setEnabled(false);	
			this.getView().byId("dateDealCreatedOn").setEnabled(false);
			
			// this.getView().byId("checkStatusTBA").setEnabled(true);
			
//			UserSalesOfficeHelp = UserSalesOffice.slice();
			setQuarter(this);
		},

		onExecute: function() {
			
			// Get the parameter names from the BOParams XSODATA
//			var oParamsModel = new sap.ui.model.odata.ODataModel("/wb_custom_developments/projects/cosmos/DealWorkflow/UI5/DealWorkflowApp/services/bo_params.xsodata/bo_params2", true);
/*			var aURL = '/wb_custom_developments/projects/cosmos/DealWorkflow/UI5/DealWorkflowApp/services/bo_params.xsodata/bo_params2';
			
//			var oContManag = sap.ui.getCore().byId("__xmlview1--multiContManag");
			var oModel = new sap.ui.model.json.JSONModel();  
			oModel.loadData(aURL, null, false, "GET", false, false, null); */
			
			var objGlobalReportParam = new Object();
//			objGlobalReportParam.cuid 					= "ARDAFb0ka5RJuQF4Pjuuo4M"; 
			// objGlobalReportParam.cuid 					= "AQPSsJDxZttEoqzucD2p4JU";
			// objGlobalReportParam.SalesOffice 			= "lsSSalesOffice";
			// objGlobalReportParam.Licensee 				= "lsSLicensee";
			// objGlobalReportParam.IP 					= "lsSIP";
			// objGlobalReportParam.DealID 				= "lsSDealID";
			// objGlobalReportParam.DealStatus 			= "lsSDealStatus";
			// objGlobalReportParam.ChangeOrderStatus 		= "lsSChangeOrderStatus";
			// objGlobalReportParam.ReportingTerritory 	= "lsSReportingTerritory";
			// objGlobalReportParam.RevRecDate 			= "lsSRevRecDate";
			// objGlobalReportParam.RoyaltiesScopeStatus 	= "lsSRoyaltiesScopeStatus";
			// objGlobalReportParam.EmployeeResponsible 	= "lsSEmployeeResponsible";
			// objGlobalReportParam.SalesExecutive 		= "lsSSalesExecutive";
			// objGlobalReportParam.CompanyCode 			= "lsSCompanyCode";
			// objGlobalReportParam.DistributionChannel 	= "lsSDistributionChannel";
			// objGlobalReportParam.Division 				= "lsSDivision";
			// objGlobalReportParam.ChangeOrderID 			= "lsSChangeOrderID";
			// objGlobalReportParam.ReportingMedia 		= "lsSReportingMedia";
			// objGlobalReportParam.TargetCurrency 		= "lsSTargetCurrency";
			// objGlobalReportParam.ContractAdminAssigned 	= "lsSContractAdminAssigned";
			// objGlobalReportParam.ContractManagerAssigned = "lsSContractManagerAssigned";
			// objGlobalReportParam.IncludeCOFinal 		= "lsSpsIncludeCOFinal"; 
			// objGlobalReportParam.IncludeCanlCO 			= "lsSpsIncludeCanlCO"; 
			// objGlobalReportParam.IncludeCanlTo 			= "lsSIncludeCanlTo"; 
			// objGlobalReportParam.DealEndDate 			= "lsSDealEndDate"; 
			// objGlobalReportParam.CurrentQuater 			= "lsSCurrentQuater"; 
			// objGlobalReportParam.LastChangedOn 			= "lsSLastChangedOn"; 
			// objGlobalReportParam.Deals 					= "lsSDeals"; 

			objGlobalReportParam.cuid 					= this.getOwnerComponent().getModel("BOParameterHelp").getProperty("/d/CUID");
			objGlobalReportParam.SalesOffice 			= this.getOwnerComponent().getModel("BOParameterHelp").getProperty("/d/SalesOffice");
			objGlobalReportParam.Licensee 				= this.getOwnerComponent().getModel("BOParameterHelp").getProperty("/d/Licensee");
			objGlobalReportParam.IP 					= this.getOwnerComponent().getModel("BOParameterHelp").getProperty("/d/IP");
			objGlobalReportParam.DealID 				= this.getOwnerComponent().getModel("BOParameterHelp").getProperty("/d/DealID");
			objGlobalReportParam.DealStatus 			= this.getOwnerComponent().getModel("BOParameterHelp").getProperty("/d/DealStatus");
			objGlobalReportParam.ChangeOrderID 			= this.getOwnerComponent().getModel("BOParameterHelp").getProperty("/d/ChangeOrderID");
			objGlobalReportParam.ChangeOrderStatus 		= this.getOwnerComponent().getModel("BOParameterHelp").getProperty("/d/ChangeOrderStatus");
			objGlobalReportParam.ReportingTerritory 	= this.getOwnerComponent().getModel("BOParameterHelp").getProperty("/d/ReportingTerritory");
			objGlobalReportParam.RevRecDate 			= this.getOwnerComponent().getModel("BOParameterHelp").getProperty("/d/RevRecDate");
			objGlobalReportParam.RoyaltiesScopeStatus 	= this.getOwnerComponent().getModel("BOParameterHelp").getProperty("/d/RoyaltiesScopeStatus");
			objGlobalReportParam.EmployeeResponsible 	= this.getOwnerComponent().getModel("BOParameterHelp").getProperty("/d/EmployeeResponsible");
			objGlobalReportParam.SalesExecutive 		= this.getOwnerComponent().getModel("BOParameterHelp").getProperty("/d/SalesExecutive");
			objGlobalReportParam.CompanyCode 			= this.getOwnerComponent().getModel("BOParameterHelp").getProperty("/d/CompanyCode");
			objGlobalReportParam.DistributionChannel 	= this.getOwnerComponent().getModel("BOParameterHelp").getProperty("/d/DistributionChannel");
			objGlobalReportParam.Division 				= this.getOwnerComponent().getModel("BOParameterHelp").getProperty("/d/Division");
			objGlobalReportParam.ChangeOrderID 			= this.getOwnerComponent().getModel("BOParameterHelp").getProperty("/d/ChangeOrderID");
			objGlobalReportParam.ReportingMedia 		= this.getOwnerComponent().getModel("BOParameterHelp").getProperty("/d/ReportingMedia");
			objGlobalReportParam.TargetCurrency 		= this.getOwnerComponent().getModel("BOParameterHelp").getProperty("/d/TargetCurrency");
			objGlobalReportParam.ContractAdminAssigned 	= this.getOwnerComponent().getModel("BOParameterHelp").getProperty("/d/ContractAdminAssigned");
			objGlobalReportParam.ContractManagerAssigned = this.getOwnerComponent().getModel("BOParameterHelp").getProperty("/d/ContractManagerAssigned");
			objGlobalReportParam.IncludeCOFinal 		= this.getOwnerComponent().getModel("BOParameterHelp").getProperty("/d/IncludeCOFinal");
			objGlobalReportParam.IncludeCanlCO 			= this.getOwnerComponent().getModel("BOParameterHelp").getProperty("/d/IncludeCanlCO");
			objGlobalReportParam.IncludeCanlTo 			= this.getOwnerComponent().getModel("BOParameterHelp").getProperty("/d/IncludeCanlTo");
			objGlobalReportParam.DealEndDate 			= this.getOwnerComponent().getModel("BOParameterHelp").getProperty("/d/DealEndDate");
			objGlobalReportParam.CurrentQuater 			= this.getOwnerComponent().getModel("BOParameterHelp").getProperty("/d/CurrentQuater");
			objGlobalReportParam.LastChangedOn 			= this.getOwnerComponent().getModel("BOParameterHelp").getProperty("/d/LastChangedOn");
			objGlobalReportParam.Deals 					= this.getOwnerComponent().getModel("BOParameterHelp").getProperty("/d/Deals");
			
			var CONST_URLPARAM1 		= "/BOE/OpenDocument/opendoc/openDocument.jsp?sap_sysid=";
			var CONST_URLPARAM2 		= "&sap_client=";
			var CONST_URLPARAM3_WEBI 	= "&sType=wid&sIDType=CUID&iDocID=";
			var CONST_URLPARAM4 		= "&sRefresh=Y&";
	
			var boServerURL = this.getOwnerComponent().getModel("BOUrlHelp").getProperty("/d/URL");
			var system		= this.getOwnerComponent().getModel("BOUrlHelp").getProperty("/d/SystemName");
			var client		= this.getOwnerComponent().getModel("BOUrlHelp").getProperty("/d/Client");
		 
			var report_type 		= "WEBI";
			var CreatedOn			= "lsSCreatedOn";
			var TransactionType		= "lsSTransactionType";
			
			// This variable will hold the final search string parameters
			var BOURLString = boServerURL + CONST_URLPARAM1 + system + CONST_URLPARAM2 + client + CONST_URLPARAM3_WEBI
	    	+ objGlobalReportParam.cuid + CONST_URLPARAM4;
	    	
			var strSearchString 	= "";
			var strAnalysisString 	= "";
			// Variable that holds the selection parameter query string
			// This is to ensure that the UI5 application is not refreshed if only Report Type has changed
			// Therefore, all except the 'Report Type' parameter are saved to this variable
			var strAnalysisStringNew = "";
			
	    	// If any of the validations fail,this variable is updated to false
			var validationSucceed 	= true;
			var atleastOneInput 	= false;
			
			/***************** Start Code for SalesOffice ***********************/
			
			var oSalesOffice = this.getView().byId("comboSalesOff");
			if(oSalesOffice.getSelectedKeys().length > 0 )
			{
				strSearchString 		= strSearchString + "&" + objGlobalReportParam.SalesOffice + "=" + getArrIDs(oSalesOffice.getSelectedKeys());//getSalesOfficeID(UserSalesOfficeHelp);
				strAnalysisStringNew 	= strAnalysisStringNew + "&" + "=" + getArrIDs(oSalesOffice.getSelectedKeys());
				atleastOneInput 		= true;
			}
		    else if(oSalesOffice.getSelectedKeys().length === 0)
			{
		    	strSearchString 		= strSearchString + "&" + objGlobalReportParam.SalesOffice + "=*";
				strAnalysisStringNew 	= strAnalysisStringNew + "&" + "=*";
			}
			/***************** End Code for SalesOffice ***********************/
			
			/***************** Start Code for Licensee ***********************/
			var oLicensee = this.getView().byId("multiLicensee");
			if(oLicensee.getTokens().length > 0 && strSearchString !== "")
			{
				strSearchString 		= strSearchString + "&" + objGlobalReportParam.Licensee + "=" + getTokIDs(oLicensee.getTokens());
				strAnalysisStringNew 	= strAnalysisStringNew + "&" + "=" + getTokIDs(oLicensee.getTokens());
				atleastOneInput 		= true;
			}
	    	else if(oLicensee.getTokens().length === 0)
			{
	    		strSearchString 		= strSearchString + "&" + objGlobalReportParam.Licensee + "=*";
				strAnalysisStringNew 	= strAnalysisStringNew + "&" + "=*";
			}
			/***************** End Code for Licensee ***********************/
			
			/***************** Start Code for IP ***********************/
			var oIP = 	this.getView().byId("multiIP");
		
	
			if(oIP.getTokens().length > 0 && strSearchString !== "")
			{
				strSearchString 		= strSearchString + "&" + objGlobalReportParam.IP + "=" + getTokIDs(oIP.getTokens());
				strAnalysisStringNew 	= strAnalysisStringNew + "&" + "=" + getTokIDs(oIP.getTokens());
				atleastOneInput 		= true;
			}
		    else if(oIP.getTokens().length === 0)
			{
		    	strSearchString 		= strSearchString + "&" + objGlobalReportParam.IP + "=*";
				strAnalysisStringNew 	= strAnalysisStringNew + "&" + "=*";
			}
			/***************** End Code for IP ***********************/
			
			/***************** Start Code for DealID ***********************/
			var oDealID = this.getView().byId("multiDealID");
	
			if(oDealID.getTokens().length > 0 && strSearchString !== "")
			{
				// Validate Deal ID's
				var dealIDList			= getTokIDValid(oDealID.getTokens());
				var aURL = '/sap/bc/zxsjs_proxy?cmd=validateDealID&DealIDList='+dealIDList;
				var oModel = new sap.ui.model.json.JSONModel();  
				oModel.loadData(aURL, null, false, "GET", false, false, null);
				if(oModel.getData()[0] !== "" && oModel.getData()[0] != null) {
					sap.m.MessageBox.show("Invalid Deal ID's Entered: " + oModel.getData()[0], { title: "Error!" });
					validationSucceed 	= false;
				}
				// strSearchString 		= strSearchString + "&" + objGlobalReportParam.DealID + "=" + getTokIDs(oDealID.getTokens());
				// strAnalysisStringNew 	= strAnalysisStringNew + "&" + "=" + getTokIDs(oDealID.getTokens());
				strSearchString 		= strSearchString + "&" + objGlobalReportParam.DealID + "=" + getTokIDValid(oDealID.getTokens());
				strAnalysisStringNew 	= strAnalysisStringNew + "&" + "=" + getTokIDValid(oDealID.getTokens());
				atleastOneInput 		= true;
			}
	    	else if(oDealID.getTokens().length === 0)
			{
	    		strSearchString 		= strSearchString + "&" + objGlobalReportParam.DealID + "=*";
				strAnalysisStringNew 	= strAnalysisStringNew + "&" + "=*";
			}
			/***************** End Code for DealID ***********************/
			
			/***************** Start Code for ChangeOrderID ***********************/
			var oChangeOrderID = this.getView().byId("multiChangeOrderID");

			if(oChangeOrderID.getTokens().length > 0 && strSearchString !== "")
			{
				// Validate Deal ID's
				var coIDList			= getTokIDValid(oChangeOrderID.getTokens());
				var aURL = '/sap/bc/zxsjs_proxy?cmd=validateChgOrdID&ChgOrdIDList='+coIDList;
				var oModel = new sap.ui.model.json.JSONModel();  
				oModel.loadData(aURL, null, false, "GET", false, false, null);
				if(oModel.getData()[0] !== "" && oModel.getData()[0] != null) {
					sap.m.MessageBox.show("Invalid Change Order ID's Entered: " + oModel.getData()[0], { title: "Error!" });
					validationSucceed 	= false;
				}
				// strSearchString 		= strSearchString + "&" + objGlobalReportParam.ChangeOrderID + "=" + getTokIDs(oChangeOrderID.getTokens());
				// strAnalysisStringNew 	= strAnalysisStringNew + "&" + "=" + getTokIDs(oChangeOrderID.getTokens());
				strSearchString 		= strSearchString + "&" + objGlobalReportParam.ChangeOrderID + "=" + getTokIDValid(oChangeOrderID.getTokens());
				strAnalysisStringNew 	= strAnalysisStringNew + "&" + "=" + getTokIDValid(oChangeOrderID.getTokens());
				atleastOneInput 		= true;
			}
	    	else if(oChangeOrderID.getTokens().length === 0)
			{
	    		strSearchString 		= strSearchString + "&" + objGlobalReportParam.ChangeOrderID + "=*";
				strAnalysisStringNew 	= strAnalysisStringNew + "&" + "=*";
			}
			/***************** End Code for ChangeOrderID ***********************/
			
			/***************** Start Code for DealStatus ***********************/
			var oDealStatus = this.getView().byId("comboDealStatus");
			var oChangeOrderStatus = this.getView().byId("comboCOStatus");
			
			if(oDealStatus.getSelectedKeys().length > 0 && strSearchString !== "")
			{
				strSearchString 		= strSearchString + "&" + objGlobalReportParam.DealStatus + "=" + getArrIDs(oDealStatus.getSelectedKeys());
				strAnalysisStringNew 	= strAnalysisStringNew + "&" + "=" + getArrIDs(oDealStatus.getSelectedKeys());
				atleastOneInput 		= true;
			}
	    	else if(oDealStatus.getSelectedKeys().length === 0 && oChangeOrderID.getTokens().length === 0 && oChangeOrderStatus.getSelectedKeys().length === 0)
			{
	    		// strSearchString 		= strSearchString + "&" + objGlobalReportParam.DealStatus + "=*";
	    		strSearchString 		= strSearchString + "&" + objGlobalReportParam.DealStatus + "=CFDF;PDRF;PPND";
				// strAnalysisStringNew 	= strAnalysisStringNew + "&" + "=*";
				strAnalysisStringNew 	= strAnalysisStringNew + "&" + "=CFDF;PDRF;PPND";
			}
			else if(oDealStatus.getSelectedKeys().length === 0) // && oChangeOrderID.getTokens().length !== 0)
			{
	    		strSearchString 		= strSearchString + "&" + objGlobalReportParam.DealStatus + "=*";
	    		// strSearchString 		= strSearchString + "&" + objGlobalReportParam.DealStatus + "=CFDF;PDRF;PPND";
				strAnalysisStringNew 	= strAnalysisStringNew + "&" + "=*";
				// strAnalysisStringNew 	= strAnalysisStringNew + "&" + "=CFDF;PDRF;PPND";
			}
			/***************** End Code for DealStatus ***********************/	
			
			/***************** Start Code for ChangeOrderStatus ***********************/
			// var oChangeOrderStatus = this.getView().byId("comboCOStatus");
		
			if(oChangeOrderStatus.getSelectedKeys().length > 0 && strSearchString !== "")
			{
				strSearchString 		= strSearchString + "&" + objGlobalReportParam.ChangeOrderStatus + "=" + getArrIDs(oChangeOrderStatus.getSelectedKeys());
				strAnalysisStringNew 	= strAnalysisStringNew + "&" + "=" + getArrIDs(oChangeOrderStatus.getSelectedKeys());
				atleastOneInput 		= true;
			}
	    	else if(oChangeOrderStatus.getSelectedKeys().length === 0 && oDealID.getTokens().length === 0 && oDealStatus.getSelectedKeys().length === 0)
			{
	    		// strSearchString 		= strSearchString + "&" + objGlobalReportParam.ChangeOrderStatus + "=*";
	    		strSearchString 		= strSearchString + "&" + objGlobalReportParam.ChangeOrderStatus + "=CORQ";
				// strAnalysisStringNew 	= strAnalysisStringNew + "&" + "=*";
				strAnalysisStringNew 	= strAnalysisStringNew + "&" + "=CORQ";
			}
			else if(oChangeOrderStatus.getSelectedKeys().length === 0) // && oDealID.getTokens().length !== 0)
			{
	    		strSearchString 		= strSearchString + "&" + objGlobalReportParam.ChangeOrderStatus + "=*";
	    		// strSearchString 		= strSearchString + "&" + objGlobalReportParam.ChangeOrderStatus + "=CORQ";
				strAnalysisStringNew 	= strAnalysisStringNew + "&" + "=*";
				// strAnalysisStringNew 	= strAnalysisStringNew + "&" + "=CORQ";
			}
			/***************** End Code for ChangeOrderStatus ***********************/
			
			/***************** Start Code for ReportingTerritory ***********************/
			var oReportingTerritory = this.getView().byId("comboRepTerri");
				
			if(oReportingTerritory.getSelectedKeys().length > 0 && strSearchString !== "")
			{
				strSearchString 		= strSearchString + "&" + objGlobalReportParam.ReportingTerritory + "=" + getArrIDs(oReportingTerritory.getSelectedKeys());
				strAnalysisStringNew 	= strAnalysisStringNew + "&" + "=" + getArrIDs(oReportingTerritory.getSelectedKeys());
				atleastOneInput 		= true;
			 }
	    	else if(oReportingTerritory.getSelectedKeys().length === 0)
			{
	    		strSearchString 		= strSearchString + "&" + objGlobalReportParam.ReportingTerritory + "=*";
				strAnalysisStringNew 	= strAnalysisStringNew + "&" + "=*";
			}
			/***************** End Code for ReportingTerritory ***********************/
			
			/***************** Start Code for RoyaltiesScopeStatus ***********************/
			var oRoyaltiesScopeStatus = this.getView().byId("comboRoyScopeStatus");
			
			if(oRoyaltiesScopeStatus.getSelectedKeys().length > 0 && strSearchString !== "")
			{
				strSearchString 		= strSearchString + "&" + objGlobalReportParam.RoyaltiesScopeStatus + "=" + getArrIDs(oRoyaltiesScopeStatus.getSelectedKeys());
				strAnalysisStringNew 	= strAnalysisStringNew + "&" + "=" + getArrIDs(oRoyaltiesScopeStatus.getSelectedKeys());
				atleastOneInput 		= true;
			}
	    	else if(oRoyaltiesScopeStatus.getSelectedKeys().length === 0)
			{
	    		strSearchString 		= strSearchString + "&" + objGlobalReportParam.RoyaltiesScopeStatus + "=*";
				strAnalysisStringNew 	= strAnalysisStringNew + "&" + "=*";
			}
			/***************** End Code for RoyaltiesScopeStatus ***********************/
			
			/***************** Start Code for EmployeeResponsible ***********************/
			var oEmployeeResponsible = this.getView().byId("multiEmpResp");
			
			if(oEmployeeResponsible.getTokens().length > 0 && strSearchString !== "")
			{
				strSearchString 		= strSearchString + "&" + objGlobalReportParam.EmployeeResponsible + "=" + getTokIDs(oEmployeeResponsible.getTokens());
				strAnalysisStringNew 	= strAnalysisStringNew + "&" + "=" + getTokIDs(oEmployeeResponsible.getTokens());
				atleastOneInput 		= true;
			}
	    	else if(oEmployeeResponsible.getTokens().length === 0)
			{
	    		strSearchString 		= strSearchString + "&" + objGlobalReportParam.EmployeeResponsible + "=*";
				strAnalysisStringNew 	= strAnalysisStringNew + "&" + "=*";
			}
			/***************** End Code for EmployeeResponsible ***********************/
			
			/***************** Start Code for SalesExecutive ***********************/
			var oSalesExecutive = this.getView().byId("multiSalesExec");
			
			if(oSalesExecutive.getTokens().length > 0 && strSearchString !== "")
			{
				strSearchString 		= strSearchString + "&" + objGlobalReportParam.SalesExecutive + "=" + getTokIDs(oSalesExecutive.getTokens());
				strAnalysisStringNew 	= strAnalysisStringNew + "&" + "=" + getTokIDs(oSalesExecutive.getTokens());
				atleastOneInput 		= true;
			}
	    	else if(oSalesExecutive.getTokens().length === 0)
			{
	    		strSearchString 		= strSearchString + "&" + objGlobalReportParam.SalesExecutive + "=*";
				strAnalysisStringNew 	= strAnalysisStringNew + "&" + "=*";
			}
			/***************** End Code for SalesExecutive ***********************/
			
			/***************** Start Code for CompanyCode ***********************/
			var oCompanyCode = this.getView().byId("comboCompCode");
			
			if(oCompanyCode.getSelectedKeys().length > 0 && strSearchString !== "")
			{
				strSearchString 		= strSearchString + "&" + objGlobalReportParam.CompanyCode + "=" + getArrIDs(oCompanyCode.getSelectedKeys());
				strAnalysisStringNew 	= strAnalysisStringNew + "&" + "=" + getArrIDs(oCompanyCode.getSelectedKeys());
				atleastOneInput 		= true;
			}
	    	else if(oCompanyCode.getSelectedKeys().length === 0)
			{
	    		strSearchString 		= strSearchString + "&" + objGlobalReportParam.CompanyCode + "=*";
				strAnalysisStringNew 	= strAnalysisStringNew + "&" + "=*";
			}
			/***************** End Code for CompanyCode ***********************/
			
			/***************** Start Code for DistributionChannel ***********************/
			var oDistributionChannel = this.getView().byId("comboDistChannel");

			if(oDistributionChannel.getSelectedKeys().length > 0 && strSearchString !== "")
			{
				strSearchString 		= strSearchString + "&" + objGlobalReportParam.DistributionChannel + "=" + getArrIDs(oDistributionChannel.getSelectedKeys());
				strAnalysisStringNew 	= strAnalysisStringNew + "&" + "=" + getArrIDs(oDistributionChannel.getSelectedKeys());
				atleastOneInput 		= true;
			}
	    	else if(oDistributionChannel.getSelectedKeys().length === 0)
			{
	    		strSearchString 		= strSearchString + "&" + objGlobalReportParam.DistributionChannel + "=*";
				strAnalysisStringNew 	= strAnalysisStringNew + "&" + "=*";
			}
			/***************** End Code for DistributionChannel ***********************/
			
			/***************** Start Code for Division ***********************/
			var oDivision = this.getView().byId("comboDivision");

			if(oDivision.getSelectedKeys().length > 0 && strSearchString !== "")
			{
				strSearchString 		= strSearchString + "&" + objGlobalReportParam.Division + "=" + getArrIDs(oDivision.getSelectedKeys());
				strAnalysisStringNew 	= strAnalysisStringNew + "&" + "=" + getArrIDs(oDivision.getSelectedKeys());
				atleastOneInput 		= true;
			}
	    	else if(oDivision.getSelectedKeys().length === 0)
			{
	    		strSearchString 		= strSearchString + "&" + objGlobalReportParam.Division + "=*";
				strAnalysisStringNew 	= strAnalysisStringNew + "&" + "=*";
			}
			/***************** End Code for Division ***********************/
		
			/***************** Start Code for IncludeCOFinal ***********************/
			strSearchString 		= strSearchString + "&" + objGlobalReportParam.IncludeCOFinal + "=*";// + oIncludeCOFinalVal;
			strAnalysisStringNew 	= strAnalysisStringNew + "&" + "=*";
			/***************** End Code for IncludeCOFinal ***********************/
		
			/***************** Start Code for IncludeCanlCO ***********************/
			strSearchString 		= strSearchString + "&" + objGlobalReportParam.IncludeCanlCO + "=*";// + oIncludeCanlCOVal;
			strAnalysisStringNew 	= strAnalysisStringNew + "&" + "=*";
			/***************** End Code for IncludeCanlCO ***********************/
			
			/***************** Start Code for ReportingMedia ***********************/
			var oReportingMedia = this.getView().byId("comboRepMedia");

			if(oReportingMedia.getSelectedKeys().length > 0 && strSearchString !== "")
			{
				strSearchString 		= strSearchString + "&" + objGlobalReportParam.ReportingMedia + "=" + getArrIDs(oReportingMedia.getSelectedKeys());
				strAnalysisStringNew 	= strAnalysisStringNew + "&" + "=" + getArrIDs(oReportingMedia.getSelectedKeys());
				atleastOneInput 		= true;
			}
	    	else if(oReportingMedia.getValue().length === 0)
			{
	    		strSearchString 		= strSearchString + "&" + objGlobalReportParam.ReportingMedia + "=*";
				strAnalysisStringNew 	= strAnalysisStringNew + "&" + "=*";
			}
			/***************** End Code for ReportingMedia ***********************/
			
			/***************** Start Code for TargetCurrency ***********************/
			var oTargetCurrency = this.getView().byId("comboTarCurr");
this.getView().byId("comboTarCurr");
			if(oTargetCurrency.getSelectedKeys().length > 0 && strSearchString != "")
			{
				strSearchString 		= strSearchString + "&" + objGlobalReportParam.TargetCurrency + "=" + getArrIDs(oTargetCurrency.getSelectedKeys());
				strAnalysisStringNew 	= strAnalysisStringNew + "&" + "=" + getArrIDs(oTargetCurrency.getSelectedKeys());
				atleastOneInput 		= true;
			}
	    	else if(oTargetCurrency.getSelectedKeys().length == 0)
			{
	    		strSearchString 		= strSearchString + "&" + objGlobalReportParam.TargetCurrency + "=*";
				strAnalysisStringNew 	= strAnalysisStringNew + "&" + "=*";
			}
			/***************** End Code for TargetCurrency ***********************/
			
			/***************** Start Code for ContractAdminAssigned ***********************/
			var oContractAdminAssigned = this.getView().byId("multiContAdmin");

			if(oContractAdminAssigned.getTokens().length > 0 && strSearchString !== "")
			{
				strSearchString 		= strSearchString + "&" + objGlobalReportParam.ContractAdminAssigned + "=" + getTokIDs(oContractAdminAssigned.getTokens());
				strAnalysisStringNew 	= strAnalysisStringNew + "&" + "=" + getTokIDs(oContractAdminAssigned.getTokens());
				atleastOneInput 		= true;
			}
	    	else if(oContractAdminAssigned.getTokens().length === 0)
			{
	    		strSearchString 		= strSearchString + "&" + objGlobalReportParam.ContractAdminAssigned + "=*";
				strAnalysisStringNew 	= strAnalysisStringNew + "&" + "=*";
			}
			/***************** End Code for ContractAdminAssigned ***********************/
			
			/***************** Start Code for ContractManagerAssigned ***********************/
			var oContractManagerAssigned = this.getView().byId("multiContManag");

			if(oContractManagerAssigned.getTokens().length > 0 && strSearchString !== "")
			{
				strSearchString 		= strSearchString + "&" + objGlobalReportParam.ContractManagerAssigned + "=" + getTokIDs(oContractManagerAssigned.getTokens());
				strAnalysisStringNew 	= strAnalysisStringNew + "&" + "=" + getTokIDs(oContractManagerAssigned.getTokens());
				atleastOneInput 		= true;
			}
	    	else if(oContractManagerAssigned.getTokens().length === 0)
			{
	    		strSearchString 		= strSearchString + "&" + objGlobalReportParam.ContractManagerAssigned + "=*";
				strAnalysisStringNew 	= strAnalysisStringNew + "&" + "=*";
			}
			/***************** End Code for ContractManagerAssigned ***********************/
			
			/***************** Start Code for IncludeCanlTo ***********************/
			strSearchString 		= strSearchString + "&" + objGlobalReportParam.IncludeCanlTo + "=*";// + oIncludeCanlToVal;
			strAnalysisStringNew 	= strAnalysisStringNew + "&" + "=*";
			/***************** End Code for IncludeCanlTo ***********************/
			
			/***************** Start Code for CurrentQuarter ***********************/
			var oCurrentQuater 	= this.getView().byId("comboQuarter");
			
			strSearchString 		= strSearchString + "&" + objGlobalReportParam.CurrentQuater + "=" + oCurrentQuater.getSelectedKey() + "." + this.getView().byId("comboYears").getSelectedKey();
			strAnalysisStringNew 	= strAnalysisStringNew + "&" + "=" + oCurrentQuater.getSelectedKey() + "." + this.getView().byId("comboYears").getSelectedKey();
			/***************** End Code for CurrentQuarter ***********************/
			
			/***************** Start Code for Deals ***********************/
			var selectedDeal = "";
			if ( this.getView().byId("checkDealWhereEnd").getSelected() === true ) {
				if ( selectedDeal === "" )
					selectedDeal = "ALLACTIVEDEALS";//sap.ui.getCore().byId("oDealsAAD").getKey();
				else
					selectedDeal = selectedDeal + ";ALLACTIVEDEALS";
			} 
		 
			if ( this.getView().byId("checkLicenseActiveQuarter").getSelected() === true ) {
				if ( selectedDeal === "" )
					selectedDeal = "CURRQTRDEALS";//sap.ui.getCore().byId("oDealsCQD").getKey();
				else
					selectedDeal = selectedDeal + ";CURRQTRDEALS";
			} 
		 
			if ( this.getView().byId("checkDealLastChanged").getSelected() === true ) {
				if ( selectedDeal === "" )
					selectedDeal = "RECENTDEALS";//sap.ui.getCore().byId("oDealsRMD").getKey();
				else
					selectedDeal = selectedDeal + ";RECENTDEALS";
			}
		 
			// if ( this.getView().byId("checkRevRecDate").getSelected() === true ) {
			// 	if ( selectedDeal === "" )
			// 		selectedDeal = "REVRECDEALS";//sap.ui.getCore().byId("oDealsRMD").getKey();
			// 	else
			// 		selectedDeal = selectedDeal + ";REVRECDEALS";
			//  }
		 
			if ( this.getView().byId("checkDealCreatedOn").getSelected() === true ) {
				if ( selectedDeal === "" )
			// Start - Below code changed to fix - CHG0055227 by XSJARABA.				 
					selectedDeal = "DEALSCREATEDON"; 
				// selectedDeal = "CREATEONDEALS";//sap.ui.getCore().byId("oDealsRMD").getKey();
			//End- Above code changed to fix - CHG0055227 by XSJARABA
				else
					selectedDeal = selectedDeal + ";DEALSCREATEDON";
			}
		 
			var oDealEndDate = this.getView().byId("dateDealWhereEnd");
			var oLastChangedOn = this.getView().byId("dateDealLastChanged");
		 
			if (selectedDeal === "ALLACTIVEDEALS") {
				if (oDealEndDate.getValue()==="") {//getYyyymmdd()==="") {
					sap.m.MessageBox.show("Enter a valid Deal End Date", { title: "Error!" });//("{i18n>MSG_DEALENDDATE_VALIDATION}");
					validationSucceed = false;
				}
			} else if (selectedDeal === "RECENTDEALS") {
				if (oLastChangedOn.getValue()==="") {//getYyyymmdd()==="") {
					sap.m.MessageBox.show("Enter a valid Last Changed On Date",{ title: "Error!" });//("{i18n>MSG_LASTCHANGEDON_VALIDATION}");
					validationSucceed = false;
				}
			}
			
			strSearchString 		= strSearchString + "&" + objGlobalReportParam.Deals + "=" + selectedDeal;
			strAnalysisStringNew 	= strAnalysisStringNew + "&" + "=" + selectedDeal;
		 
			/***************** End Code for Deals ***********************/
			strAnalysisString 		= strSearchString;
			strSearchString 		= BOURLString + strSearchString;
			
			/***************** Start Code for RevRecDate ***********************/
			// var oRevRecDate = this.getView().byId("dateRevenueRecog");
		 
			// if (oRevRecDate.getValue() === "") {
				strSearchString 		= strSearchString + "&" + objGlobalReportParam.RevRecDate + "=Date(1800,01,01)";
				strAnalysisString 		= strAnalysisString + "&" + objGlobalReportParam.RevRecDate + "=1800-01-01";
				strAnalysisStringNew 	= strAnalysisStringNew + "&" + "=1800-01-01";
			// } else {
			// 	var oRevRecDateVal = oRevRecDate.getDateValue();
			// 	strSearchString 		= strSearchString + "&" + objGlobalReportParam.RevRecDate + "=Date(" + oRevRecDateVal.getFullYear() + "," + oRevRecDateVal.getMonth() + "," + oRevRecDateVal.getDate() + ")";
			// 	strAnalysisString 		= strAnalysisString + "&" + objGlobalReportParam.RevRecDate + "=" + oRevRecDateVal.getFullYear() + "-" + oRevRecDateVal.getMonth() + "-" + oRevRecDateVal.getDate();
			// 	strAnalysisStringNew 	= strAnalysisStringNew + "&" + "=" + oRevRecDateVal.getFullYear() + "-" + oRevRecDateVal.getMonth() + "-" + oRevRecDateVal.getDate();
			// 	atleastOneInput 		= true;
			// }
			/***************** End Code for RevRecDate ***********************/
			
			/***************** Start Code for DealEndDate ***********************/
			if (oDealEndDate.getValue() === "") {//getYyyymmdd() === "") {
				strSearchString 		= strSearchString + "&" + objGlobalReportParam.DealEndDate + "=Date(1800,01,01)";
				strAnalysisString 		= strAnalysisString + "&" + objGlobalReportParam.DealEndDate + "=1800-01-01";
				strAnalysisStringNew 	= strAnalysisStringNew + "&" + "=1800-01-01";
			} else {
				var oDealEndDateVal = oDealEndDate.getDateValue();
				var mon 	= oDealEndDateVal.getMonth()+1;
				var day 	= oDealEndDateVal.getDate();
				var month 	= "";
				var days 	= "";
				if (mon<10)
					month 	= "0"+mon;
				else
					month 	= mon;
				if (day<10)
					days 	= "0"+day;
				else
					days 	= day;
			 
				strSearchString 		= strSearchString + "&" + objGlobalReportParam.DealEndDate + "=Date(" + oDealEndDateVal.getFullYear() + "," + oDealEndDateVal.getMonth() + "," + oDealEndDateVal.getDate() + ")";
				strAnalysisString 		= strAnalysisString + "&" + objGlobalReportParam.DealEndDate + "=" + oDealEndDateVal.getFullYear() + "-" + month + "-" + days;
				strAnalysisStringNew 	= strAnalysisStringNew + "&" + "=" + oDealEndDateVal.getFullYear() + "-" + month + "-" + days;
			}
			/***************** End Code for DealEndDate ***********************/
			
			/***************** Start Code for LastChangedOn ***********************/
			if (oLastChangedOn.getValue() === "") {
				strSearchString 		= strSearchString + "&" + objGlobalReportParam.LastChangedOn + "=Date(1800,01,01)";
				strAnalysisString 		= strAnalysisString + "&" + objGlobalReportParam.LastChangedOn + "=1800-01-01";
				strAnalysisStringNew 	= strAnalysisStringNew + "&" + "=1800-01-01";
			} else {
				var oLastChangedOnVal 	= oLastChangedOn.getDateValue();
				var mon 				= oLastChangedOnVal.getMonth()+1;
				var day 				= oLastChangedOnVal.getDate();
				var month 				= "";
				var days 				= "";
				if (mon<10)
					month 	= "0"+mon;
				else
					month 	= mon;
				if (day<10)
					days	= "0"+day;
				else
					days	= day;
			 
				strSearchString 		= strSearchString + "&" + objGlobalReportParam.LastChangedOn + "=Date(" + oLastChangedOnVal.getFullYear() + "," + (oLastChangedOnVal.getMonth() + 1) + "," + oLastChangedOnVal.getDate() + ")";
				strAnalysisString 		= strAnalysisString + "&" + objGlobalReportParam.LastChangedOn + "=" + oLastChangedOnVal.getFullYear() + "-" + month + "-" + days;
				strAnalysisStringNew 	= strAnalysisStringNew + "&" + "=" + oLastChangedOnVal.getFullYear() + "-" + month + "-" + days;
			}
			/***************** End Code for LastChangedOn ***********************/
			
			/**************** Start of code to add Rev Recog Date From, Rev Recog Date To, Billing Review, Revenue Review ***********************/
			// var oRevRecDateFrom = this.getView().byId("dateRevenueRecog");
			// var oRevRecDateTo	 = this.getView().byId("dateRevenueRecog");
		 
			// if (oRevRecDateFrom.getValue() === "") {
				strSearchString 		= strSearchString + "&" + "RevRecDateFrom" + "=Date(1800,01,01)";
				strAnalysisString 		= strAnalysisString + "&RevRecDateFrom=1800-01-01";
				strAnalysisStringNew 	= strAnalysisStringNew + "&" + "=1800-01-01";
				strSearchString 		= strSearchString + "&" + "RevRecDateTo" + "=Date(1800,01,01)";
			 	strAnalysisString 		= strAnalysisString + "&RevRecDateTo=1800-01-01";
				strAnalysisStringNew 	= strAnalysisStringNew + "&" + "=1800-01-01";
			// } else {
			// 	var oRevRecDateFrom 	= oRevRecDateFrom.getDateValue();
			// 	var mon 	= oRevRecDateFrom.getMonth()+1;
			// 	var day 	= oRevRecDateFrom.getDate();
			// 	var month 	= "";
			// 	var days 	= "";
			// 	if (mon<10)
			// 		month 	= "0"+mon;
			// 	else
			// 		month 	= mon;
			// 	if (day<10)
			// 		days 	= "0"+day;
			// 	else
			// 		days	= day;
			 
			// 	strSearchString 		= strSearchString + "&RevRecDateFrom=Date(" + oRevRecDateFrom.getFullYear() + "," + (oRevRecDateFrom.getMonth() + 1) + "," + oRevRecDateFrom.getDate() + ")";
			// 	strAnalysisString 		= strAnalysisString + "&RevRecDateFrom=" + oRevRecDateFrom.getFullYear() + "-" + month + "-" + days;
			// 	strAnalysisStringNew 	= strAnalysisStringNew + "&" + "=" + oRevRecDateFrom.getFullYear() + "-" + month + "-" + days;
				
			// 	var oRevRecDateTo = oRevRecDateTo.getSecondDateValue();
			// 	var mon 	= oRevRecDateTo.getMonth()+1;
			// 	var day 	= oRevRecDateTo.getDate();
			// 	var month 	= "";
			// 	var days 	= "";
			// 	if (mon<10)
			// 		month 	= "0"+mon;
			// 	else
			// 		month 	= mon;
			// 	if (day<10)
			// 		days 	= "0"+day;
			// 	else
			// 		days	= day;
				 
			// 	strSearchString 		= strSearchString + "&RevRecDateTo=Date(" + oRevRecDateTo.getFullYear() + "," + (oRevRecDateTo.getMonth() + 1) + "," + oRevRecDateTo.getDate() + ")";
			// 	strAnalysisString 		= strAnalysisString + "&RevRecDateTo=" + oRevRecDateTo.getFullYear() + "-" + month + "-" + days;
			// 	strAnalysisStringNew 	= strAnalysisStringNew + "&" + "=" + oRevRecDateTo.getFullYear() + "-" + month + "-" + days;
			// }
		 
/*			if (oRevRecDateTo.getValue() === "") {
				strSearchString 		= strSearchString + "&" + "RevRecDateTo" + "=Date(1800,01,01)";
			 	strAnalysisString 		= strAnalysisString + "&RevRecDateTo=1800-01-01";
				strAnalysisStringNew 	= strAnalysisStringNew + "&" + "=1800-01-01";
			} else {
				var oRevRecDateTo = oRevRecDateTo.getSecondDateValue();
				var mon 	= oRevRecDateTo.getMonth()+1;
				var day 	= oRevRecDateTo.getDate();
				var month 	= "";
				var days 	= "";
				if (mon<10)
					month 	= "0"+mon;
				else
					month 	= mon;
				if (day<10)
					days 	= "0"+day;
				else
					days	= day;
				 
				strSearchString 		= strSearchString + "&RevRecDateTo=Date(" + oRevRecDateTo.getFullYear() + "," + (oRevRecDateTo.getMonth() + 1) + "," + oRevRecDateTo.getDate() + ")";
				strAnalysisString 		= strAnalysisString + "&RevRecDateTo=" + oRevRecDateTo.getFullYear() + "-" + month + "-" + days;
				strAnalysisStringNew 	= strAnalysisStringNew + "&" + "=" + oRevRecDateTo.getFullYear() + "-" + month + "-" + days;
			} */
		 
			// var DropDownBilling = this.getView().byId("comboBillingReview");
			// var billing = "";
			// if (DropDownBilling.getSelectedKey() === "NA")
			// 	billing = "*";
			// else if (DropDownBilling.getSelectedKey() === "Yes")
			// 	billing = "Yes";
			// else if (DropDownBilling.getSelectedKey() === "No")
			// 	billing = "No";
		 
			var billing = "*";
			strSearchString 		= strSearchString + "&BillingReview="+billing;
			strAnalysisString 		= strAnalysisString + "&BillingReview="+billing;
			strAnalysisStringNew 	= strAnalysisStringNew + "&" + "=" + billing;
		 
			// var oDropDownRevenue 	= this.getView().byId("comboRevenueReview");
			// var revenue = "";
			// if (oDropDownRevenue.getSelectedKey() === "NA")
			// 	revenue = "*";
			// else if (oDropDownRevenue.getSelectedKey() === "Yes")
			// 	revenue = "Yes";
			// else if (oDropDownRevenue.getSelectedKey() === "No")
			// 	revenue = "No";
			
			var revenue = "*";
			strSearchString 		= strSearchString + "&RevenueReview="+revenue;
			strAnalysisString 		= strAnalysisString + "&RevenueReview="+revenue;
			strAnalysisStringNew 	= strAnalysisStringNew + "&" + "=" + revenue;
			/**************** End of code to add Rev Recog Date From, Rev Recog Date To, Billing Review, Revenue Review ***********************/
			
			/********** Start code for Deal Created on, Transaction Type and Revenue Recognition status *******************/
			var oDealCreatedOn = this.getView().byId("dateDealCreatedOn");
			if (oDealCreatedOn.getValue() === "") {
				strSearchString 		= strSearchString + "&" + CreatedOn + "=Date(1800,01,01)";
				strAnalysisString 		= strAnalysisString + "&" + CreatedOn + "=1800-01-01";
				strAnalysisStringNew 	= strAnalysisStringNew + "&" + "=1800-01-01";
			} else {
				oDealCreatedOn = oDealCreatedOn.getDateValue();
				var mon 	= oDealCreatedOn.getMonth()+1;
				var day 	= oDealCreatedOn.getDate();
				var month 	= "";
				var days 	= "";
				if (mon<10)
					month 	= "0"+mon;
				else
					month 	= mon;
				if (day<10)
					days 	= "0"+day;
				else
					days=day;
				 
				strSearchString 		= strSearchString + "&"+CreatedOn+"=Date(" + oDealCreatedOn.getFullYear() + "," + (oDealCreatedOn.getMonth() + 1) + "," + oDealCreatedOn.getDate() + ")";
				strAnalysisString 		= strAnalysisString + "&"+CreatedOn+"=" + oDealCreatedOn.getFullYear() + "-" + month + "-" + days;
				strAnalysisStringNew 	= strAnalysisStringNew + "&" + "=" + oDealCreatedOn.getFullYear() + "-" + month + "-" + days;
			} 
	
			var oTransactionType = this.getView().byId("comboTranType");
			if(oTransactionType.getSelectedKeys().length > 0 )
			{
				strSearchString 		= strSearchString + "&" + TransactionType + "=" + getArrIDs(oTransactionType.getSelectedKeys());
				strAnalysisString 		= strAnalysisString + "&" + TransactionType + "=" + getArrIDs(oTransactionType.getSelectedKeys());
				strAnalysisStringNew 	= strAnalysisStringNew + "&" + "=" + getArrIDs(oTransactionType.getSelectedKeys());
			}
		    else if(oTransactionType.getSelectedKeys().length == 0)
			{
		    	strSearchString 		= strSearchString + "&" + TransactionType + "=ZIPM;ZICM";
		    	strAnalysisString 		= strAnalysisString + "&" + TransactionType + "=ZIPM;ZICM";
				strAnalysisStringNew 	= strAnalysisStringNew + "&" + "=ZIPM;ZICM";
			}
			
			// if ( this.getView().byId("checkStatusTBA").getSelected() === true ) {
			// 	strSearchString 		= strSearchString + "&RevRecogStatus=TBA";
			// 	strAnalysisString 		= strAnalysisString + "&RevRecogStatus=TBA";
			// 	strAnalysisStringNew 	= strAnalysisStringNew + "&" + "=TBA";
			// } else {
				strAnalysisString 		= strAnalysisString + "&RevRecogStatus=*";
				strSearchString 		= strSearchString + "&RevRecogStatus=*";
				strAnalysisStringNew 	= strAnalysisStringNew + "&" + "=*";
			// }
			/********** End of code for Deal Created on, Transaction Type and Revenue Recognition status *******************/
			 
			strSearchString 	= strSearchString + "&ReportType=true";
			strAnalysisString 	= strAnalysisString + "&ReportType=true";
			
			strSearchString  = strSearchString.replace("RevRecDateFrom","lsSRevRecDateFrom");
			strSearchString  = strSearchString.replace("RevRecDateTo","lsSRevRecDateTo");
			strSearchString  = strSearchString.replace("BillingReview","lsSBillingReview");
			strSearchString  = strSearchString.replace("RevenueReview","lsSRevenueReview");
			strSearchString  = strSearchString.replace("RevRecogStatus","lsSRevRecogStatus");
			
			if (atleastOneInput === false) {
				// sap.m.MessageBox.show("Enter at least one search criteria.", { title: "Error!" });
				sap.m.MessageBox.show("Enter at least one search criteria from the General Selection block.", { title: "Error!" });
				validationSucceed 	= false;
			}
			
			// To ensure that at least one checkbox in the 'Deal Selections' block is selected
			if ( this.getView().byId("checkDealWhereEnd").getSelected() 		=== false
				&& this.getView().byId("checkLicenseActiveQuarter").getSelected() 	=== false
				&& this.getView().byId("checkDealLastChanged").getSelected() 	=== false
				// &&	this.getView().byId("checkRevRecDate").getSelected() === false
				&& this.getView().byId("checkDealCreatedOn").getSelected() 	=== false ) 
			{
				sap.m.MessageBox.show("Select at least one search criteria from the Date Selection block.", { title: "Error!" });
				validationSucceed 	= false;
			} 
			
			if (validationSucceed === true) {
				var aURL = '/sap/bc/zxsjs_proxy?cmd=getDealHeader'+strAnalysisString;
	
				var oModel = new sap.ui.model.json.JSONModel();  
				var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
				var currentView = this;
				var busyDialog = new sap.m.BusyDialog();
				busyDialog.setText("Loading Deal Data");
				busyDialog.open();
				
	//			currentView.getOwnerComponent().setModel(oModel, "searchResult");
				oModel.loadData(aURL, null, true, "GET", false, false, null);
			//	oModel.loadData("localService/dealQuery.json");
				oModel.attachRequestCompleted(function() {
					if ( oModel.getData().PurchaseOrderCollection.length !== 0 ) {
						currentView.getOwnerComponent().setModel(oModel, "searchResult");
						busyDialog.close();
						oRouter.navTo("masterRoute");
					} else {
	//					var lv_message 		= "No data found for the entered selection criteria";
	//					sap.m.MessageBox.show(lv_message);
						busyDialog.close();
						sap.m.MessageBox.show("No data found. Please refine the search criteria.", { title: "Error!" });
//						oRouter.navTo("notFound");
					}
				});
			}
/*
			var oModel = new JSONModel();
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			var currentView = this;

			oModel.loadData("localService/dealQuery.json");

			oModel.attachRequestCompleted(function() {
				currentView.getOwnerComponent().setModel(oModel, "searchResult");
				oRouter.navTo("masterRoute"); 

			}); */
			//	sap.ui.core.UIComponent.getRouterFor(this).navTo("masterRoute");

		}

	});

});

function onLoadLicensee(myJSON) {
	var oLicensee = this.getView().byId("dateDealCreatedOn");
	var oModel = new sap.ui.model.json.JSONModel();
	oModel.setData(myJSON);
	oLicensee.setModel(oModel);
	oLicensee.bindAggregation("suggestionItems", "/", new sap.ui.core.Item({text: "{terms}"}));
};

function onLoadDealID(myJSON) {
	var oDealID = this.getView().byId("multiDealID");
	var oModel = new sap.ui.model.json.JSONModel();  
//	oModel.loadData(aURL, null, false, "GET", false, false, null);
	oModel.setData(myJSON);
	oDealID.setModel(oModel);
	oDealID.bindAggregation("suggestionItems", "/", new sap.ui.core.Item({text: "{terms}"})); 
}

function getTokIDs(tokens)
{
    var retval 		= "";
    var tokText 	= "";
    var tokTextArr 	= "";
    for (var i=0;i<tokens.length;i++) {
      if (tokens[i]!==""){
    	tokText 	= tokens[i].getText();
    	tokTextArr 	= tokText.split("|");
        retval 		= retval + tokTextArr[1].trim() + ";";
      }
    }
    retval 			= retval.substring(0, retval.length - 1);
	return retval;
};

function getArrIDs(arr)
{
    //var val = "";
	var retval = "";
    for (var i=0;i<arr.length;i++) {
      if (arr[i]!==""){
    	retval = retval + arr[i].trim() + ";";
      }
    }
    retval = retval.substring(0, retval.length - 1);
	return retval;
};

/*
 * This method will return the date in yyyymmdd format.
 */

function yyyymmdd(objDtdateIn, strType) {
	var yyyy = objDtdateIn.getFullYear();
	var mm = objDtdateIn.getMonth() + 1; // getMonth() is zero-based
	var dd = objDtdateIn.getDate();
	
	if ( strType === "today" ) {
	
	} else if (strType === "quarterstart") {
		if ( mm >= 10 ) {
			mm = 10;
		} else if (mm >= 7 ) {
			mm = 7;
		} else if (mm >= 4) {
			mm = 4;
		} else {
			mm = 1;
		}
		dd = 1;
	}
	return String(10000 * yyyy + 100 * mm + dd); // Leading zeros for mm and dd
};

/*
 * This function is used to set the Quater value based on Deal End Date.
 */

function setQuarter (currView) {
	var dealEndDateVal = new Date();
	var dealEndDateMon = dealEndDateVal.getMonth();
	if ( dealEndDateMon !== "" ) {
		if ( dealEndDateMon >= 10) {
			dealEndDateMon = "Q4";
		} else if ( dealEndDateMon >= 7) {
			dealEndDateMon = "Q3";
		} else if ( dealEndDateMon >= 4) {
			dealEndDateMon = "Q2";
		} else if ( dealEndDateMon >= 0) {
			dealEndDateMon = "Q1";
		}
		
		currView.getView().byId("comboQuarter").setSelectedKey(dealEndDateMon);
		
		var oCurrentQuaterYear = new Date();
		currView.getView().byId("comboYears").setSelectedKey(oCurrentQuaterYear.getFullYear());
	}
};


/*
 * This function is used to validate Deal ID
 */
function getTokIDValid(tokens) {
	var retval		= "";
	var tokText		= "";
	var tokTextArr	= "";
	
	for(var i=0;i<tokens.length;i++) {
		if(tokens[i]!=="") {
			tokText		= tokens[i].getText();
			tokTextArr	= tokText.split("|");
			if(tokTextArr[1] != null)
				retval = retval + tokTextArr[1].trim() + ";";
			else
				retval = retval + tokTextArr[0].trim() + ";";
		}
	}
	retval	= retval.substring(0, retval.length - 1) + ";";
	return retval;
};