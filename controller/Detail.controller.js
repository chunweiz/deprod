/*global location */
sap.ui.define([
	"wb/cosmos/dealapp/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessagePopover",
	"sap/m/MessagePopoverItem",
	'sap/m/MessageToast'


], function(BaseController, JSONModel, formatter , MessagePopover, MessagePopoverItem, MessageToast) {
	"use strict";
	var oMessagePopover = new sap.m.MessagePopover("msgPop");
	

	var detailController =  BaseController.extend("wb.cosmos.dealapp.controller.Detail");
	
	detailController.prototype.onInit = function(){
		this._oDealLocker = null;
		this._oDataModel = this.getView().getModel("dealInfo");
		this.getOwnerComponent().setModel(new JSONModel({dealID: ""}), "selectedDeal");
		this.getView().setModel(new JSONModel({	count: 0 }), "msgCount");
		this.getRouter().getRoute("detailRoute").attachPatternMatched(this._onObjectMatched, this);
	};
	
	// detailController.prototype.test = function(){
	// 		console.log("testing");
	//  	};
	
	detailController.prototype.onToggleFullScreen = function(oEvent){
		var button = this.byId(oEvent.getSource().sId);

		if (this._getSplitContObj().getMode() !== sap.m.SplitAppMode.HideMode) {
			this._getSplitContObj().setMode(sap.m.SplitAppMode.HideMode);
			button.setIcon("sap-icon://exit-full-screen");

		} else {
			this._getSplitContObj().setMode(sap.m.SplitAppMode.ShowHideMode);
			button.setIcon("sap-icon://full-screen");
		}
	};
		
	detailController.prototype._getMessages = function(sObjectId){
		var that = this;
		this.getView().getModel("dealInfo").read("/DealHeaderSet('" + sObjectId + "')/DealMessageSet", {
			success: function(oData, oResponse) {
				var oODataJSONModel = new sap.ui.model.json.JSONModel();
				oODataJSONModel.setData(oData);
				var messageCount = oODataJSONModel.getProperty("/__count");
				that.getView().setModel(new JSONModel({
					count: messageCount
				}), "msgCount");
				
				for( var i = 0 ; i < messageCount ; i++ ){
					var oMessageTemplate = new  sap.m.MessagePopoverItem({
						type: oODataJSONModel.getProperty("/results/"+i+"/MessageType"),
						title: oODataJSONModel.getProperty("/results/"+i+"/MessageContent")
					});
					oMessagePopover.insertItem(oMessageTemplate,-1);
				} 
				
			},
			error: function(oError) {
				sap.ui.core.BusyIndicator.hide();
				console.log("Erro when getting Messager", oError);
			}
		});
	};
	detailController.prototype._onObjectMatched = function(oEvent){
		   var that = this;
		   var oRb = this.getOwnerComponent().getModel("i18n").getResourceBundle();
		   var sObjectId = oEvent.getParameter("arguments").id;
		   var oldDeal = this.getOwnerComponent().getModel("selectedDeal").getProperty("/dealID");
			sap.ui.core.BusyIndicator.show();
		    clearInterval(this._oDealLocker);
		
			
			this.getView().getModel("dealInfo").callFunction("/isDealLocked",{
				method:"POST", 
				urlParameters:{"DealID" : sObjectId,"LockDeal" : true,"DealIDOld" : oldDeal},
				success: function(oData, response) {
						if( oData.MessageType === 'S' ){
							that._oDealLocker =	setInterval(function(){that.lockDeal(sObjectId);},25000);
							that._fetchDealInfo(sObjectId,true);
						}
						else{
							sap.m.MessageBox.information(
								oData.MessageContent,
									{
										styleClass:"sapUiSizeCompact"
									}
							);
							that._fetchDealInfo(sObjectId,false);
							
						}
				}, 
				error: function(oError){ 
							console.log(oError);
						},
				async: false
			});
	};
	
	detailController.prototype._fetchDealInfo = function(sObjectId,setEnabled){
		var that = this;
		
		this.getView().setModel(this.getOwnerComponent().getModel("dealInfo"), "dealInfo");
		this.getView().getModel("dealInfo").setUseBatch(false);
		this.getView().getModel("dealInfo").read("/DealHeaderSet('" + sObjectId + "')", {
			success: function(oData, oResponse) {
				
				that.getView().byId("Save").setEnabled(setEnabled);
		
				var oODataJSONModel = new sap.ui.model.json.JSONModel();
				
				// set the odata JSON as data of JSON model  
				that.getOwnerComponent().setModel(new JSONModel({
					dealID: sObjectId
				}), "selectedDeal");
				
				// reset message model
				oMessagePopover.destroyItems();
				that.getView().setModel(new JSONModel({
					count: 0
				}), "msgCount");
				that._getMessages(sObjectId);
				
				// store the model
				oODataJSONModel.setData(oData);
				that.getView().setModel(oODataJSONModel, "localModel");
				
		        //refresh Licensee Fee Tab             
			    that.getView().byId("LFeeTab").getController().rebindLicenseeFeeTab();
			    that.getView().byId("LFeeTab").getController().setLicenseeFeeTabEditable(setEnabled);
			
				//refresh Rights Tab             
			    that.getView().byId("RightsTab").getController().rebindRightsTab();
			    that.getView().byId("RightsTab").getController().setEditRightsTabEditable(setEnabled);
			    
			    //refresh Rights Dimension Tab             
				that.getView().byId("RightsDimTab").getController().rebindRightsDimTab();
				that.getView().byId("RightsDimTab").getController().setEditRightsDimTabEditable(setEnabled);
			   
				sap.ui.core.BusyIndicator.hide();
			},
			error: function(oError) {
				sap.ui.core.BusyIndicator.hide();
				console.log("Error", oError);
			}
		});
	};		
	detailController.prototype._getSplitContObj = function(oEvent){
			var result = sap.ui.getCore().byId(this.getOwnerComponent().getModel("splitContainerID").getProperty("/id"));
			if (!result) {
				jQuery.sap.log.error("SplitApp object can't be found");
			}
			return result;
	};
	
	detailController.prototype.lockDeal = function(sObjectId){
			
			
			this.getView().getModel("dealInfo").setUseBatch(false);
			this.getView().getModel("dealInfo").callFunction("/isDealLocked",{
				method:"POST", 
				urlParameters:{"DealID" : sObjectId,"LockDeal" : false , "DealIDOld" : ""},
				success: function(oData, response) {
						console.log("Success at Locking" + sObjectId);
				}, 
				error: function(oError){ 
							console.log(oError);
						}
				});
	};
		
	detailController.prototype.handleMessagePopoverPress = function(oEvent){
		oMessagePopover.openBy(oEvent.getSource());
	};

	detailController.prototype.onSave = function(oEvent){
		var that = this;
			var requestBody = {};
			
			var oRb = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			var id = this.getOwnerComponent().getModel("selectedDeal").getProperty("/dealID");
			requestBody.DealID = id;
			
			// License Fee Save
			var LFeeData = this.getView().byId("LFeeTab").getController().getSelectedRow();
			var LFRequest = [];
			for( var i = 0 ; i < LFeeData.oData.length ; i++ ){
				if( LFeeData.oData[i].DealChanged === "true" ){
					var ScopeIDstr = LFeeData.oData[i].ScopeID.toString();
					var LicenseFeePerIncrementstr = LFeeData.oData[i].LicenseFeePerIncrement.toString();
					var NumOfIncrementstr = LFeeData.oData[i].NumOfIncrement.toString();
					LFRequest.push({ DealID: LFeeData.oData[i].DealID ,
									 ItemGuid : LFeeData.oData[i].ItemGuid,
								 	 ScopeID : ScopeIDstr,
									 PeriodID : LFeeData.oData[i].PeriodID,
									 RoyaltyCatg : LFeeData.oData[i].RoyaltyCatg,
									 LicenseFeePerIncrement : LicenseFeePerIncrementstr,
									 ProtectPricingFlag : LFeeData.oData[i].ProtectPricingFlag,
									 NumOfIncrement : NumOfIncrementstr
					});	
				}
			}
			
			
			// Rights Save
			var RightsRequest = [];
			var RightsData = this.getView().byId("RightsTab").getController().getSelectedRow();
		
			for( var i = 0 ; i < RightsData.oData.length ; i++ ){
				if( RightsData.oData[i].DealChanged === "true" ){
					var ScopeIDStr = RightsData.oData[i].ScopeID.toString();
			 		RightsRequest.push({ DealID: RightsData.oData[i].DealID ,
			 							 ItemGuid : RightsData.oData[i].ItemGuid,
			 					 		 ScopeID : ScopeIDStr,
			 							 PeriodYearID : RightsData.oData[i].PeriodYearID,
			 							 RoyaltyCatg : RightsData.oData[i].RoyaltyCatg,
			 							 ValidFrom : RightsData.oData[i].ValidFrom,
			 							 ValidFromStatus : RightsData.oData[i].ValidFromStatus,
			 							 ValidTo : RightsData.oData[i].ValidTo,
			 							 ValidToStatus : RightsData.oData[i].ValidToStatus,
			 							 Exclusivity : RightsData.oData[i].Exclusivity,
			 							 RunsUOMUnit1 : RightsData.oData[i].RunsUOMUnit1,
										 RunsUOM1 : RightsData.oData[i].RunsUOM1,
										 RunsUOMUnit2 : RightsData.oData[i].RunsUOMUnit2,
										 RunsUOM2 : RightsData.oData[i].RunsUOM2,
										 RunsUOMUnit3 : RightsData.oData[i].RunsUOMUnit3,
										 RunsUOM3 : RightsData.oData[i].RunsUOM3
					});	
				}
			} 
			
			// Rights Dimension Save
			var RightsDimRequest = [];
			var RightsDimData = this.getView().byId("RightsDimTab").getController().getSelectedRow();
		
			for( var i = 0 ; i < RightsDimData.oData.length ; i++ ){
				if( RightsDimData.oData[i].DealChanged === "true" ){
					var ScopeIDStr = RightsDimData.oData[i].ScopeID.toString();
			 		RightsDimRequest.push({ DealID: RightsDimData.oData[i].DealID ,
			 								ItemGuid : RightsDimData.oData[i].ItemGuid,
			 					 			ScopeID : ScopeIDStr,
			 								Media : RightsDimData.oData[i].Media,
			 								RightsGroup : RightsDimData.oData[i].RightsGroup,
			 								Territory : RightsDimData.oData[i].Territory,
			 								Language : RightsDimData.oData[i].Language,
			 								TerrCode : RightsDimData.oData[i].TerrCode,
			 								LangCode : RightsDimData.oData[i].LangCode
					});	
				}
			} 
			
			
			// Save Updated Details
			if ( LFRequest.length === 0 && RightsRequest.length === 0 && RightsDimRequest.length === 0 ) {
				sap.m.MessageBox.information(
				oRb.getText("noChangeFound"),
					{
						styleClass:"sapUiSizeCompact"
					}
				);
				return;
			}
			
			requestBody.DealLicenseFeeSet = LFRequest;
			requestBody.DealRightsSet = RightsRequest;
			requestBody.DealDimensionSet = RightsDimRequest;
			
			this.getView().getModel("dealInfo").setUseBatch(false);
			this.getView().getModel("dealInfo").create("/DealHeaderSet",requestBody, {
				success: function(oData, oResponse) { 
					// console.log(oData); 
					// console.log(oResponse);
					that.getView().byId("LFeeTab").getController().setLicenseeFeeTabEditable(false);
					that.getView().byId("RightsTab").getController().setEditRightsTabEditable(false);
					that.getView().byId("RightsDimTab").getController().setEditRightsDimTabEditable(false);

					that.getView().byId("Save").setEnabled(false);
					clearInterval(that._oDealLocker);
					sap.m.MessageBox.information(
					oRb.getText("saveSuccessful",id),
						{
							styleClass:"sapUiSizeCompact"
						}
					);
					
				},
				error: function(oData, oResponse) { console.log(oData); console.log(oResponse); alert('Failure'); }
			});
			
	};		
	
	
	

	return detailController;

		//formatter: formatter,
	
		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */

	// 	onInit: function() {

	// 		this.getOwnerComponent().setModel(new JSONModel({dealID: ""}), "selectedDeal");
	// 		this.getRouter().getRoute("detailRoute").attachPatternMatched(this._onObjectMatched, this);
	// 		this.getView().setModel(new JSONModel({
	// 			count: 0
	// 		}), "msgCount");

	// 	},

	// 	onToggleFullScreen: function(oEvent) {

	// 		var button = this.byId(oEvent.getSource().sId);
	// 		//			var button = sap.ui.getCore().byId("fullScreenBtn");

	// 		if (this._getSplitContObj().getMode() !== sap.m.SplitAppMode.HideMode) {
	// 			this._getSplitContObj().setMode(sap.m.SplitAppMode.HideMode);
	// 			button.setIcon("sap-icon://exit-full-screen");

	// 		} else {
	// 			this._getSplitContObj().setMode(sap.m.SplitAppMode.ShowHideMode);
	// 			button.setIcon("sap-icon://full-screen");
	// 		}
	// 	},
	// 	/**
	// 	 * Updates the item count within the line item table's header
	// 	 * @param {object} oEvent an event containing the total number of items in the list
	// 	 * @private
	// 	 */
	// 	onListUpdateFinished: function(oEvent) {
	// 		var sTitle,
	// 			iTotalItems = oEvent.getParameter("total"),
	// 			oViewModel = this.getModel("detailView");

	// 		// only update the counter if the length is final
	// 		if (this.byId("lineItemsList").getBinding("items").isLengthFinal()) {
	// 			if (iTotalItems) {
	// 				sTitle = this.getResourceBundle().getText("detailLineItemTableHeadingCount", [iTotalItems]);
	// 			} else {
	// 				//Display 'Line Items' instead of 'Line items (0)'
	// 				sTitle = this.getResourceBundle().getText("detailLineItemTableHeading");
	// 			}
	// 			oViewModel.setProperty("/lineItemListTitle", sTitle);
	// 		}
	// 	},
 
	// 	/* =========================================================== */
	// 	/* begin: internal methods                                     */
	// 	/* =========================================================== */
	// 	_getMessages: function(sObjectId){
	// 		var that = this;
	// 		this.getView().getModel("dealInfo").read("/DealHeaderSet('" + sObjectId + "')/DealMessageSet", {
	// 			success: function(oData, oResponse) {
	// 				var oODataJSONModel = new sap.ui.model.json.JSONModel();
	// 				oODataJSONModel.setData(oData);
	// 				var messageCount = oODataJSONModel.getProperty("/__count");
	// 				that.getView().setModel(new JSONModel({
	// 					count: messageCount
	// 				}), "msgCount");
					
	// 				for( var i = 0 ; i < messageCount ; i++ ){
	// 					var oMessageTemplate = new  sap.m.MessagePopoverItem({
	// 						type: oODataJSONModel.getProperty("/results/"+i+"/MessageType"),
	// 						title: oODataJSONModel.getProperty("/results/"+i+"/MessageContent")
	// 					});
	// 					oMessagePopover.insertItem(oMessageTemplate,-1);
	// 				} 
					
	// 			},
	// 			error: function(oError) {
	// 				sap.ui.core.BusyIndicator.hide();
	// 				console.log("Erro when getting Messager", oError);
	// 			}
	// 		});
	// 	},
	// 	isLocked: function(sObjectId){
	// 		var that = this;
	// 		var locked;
	// 		this.getView().getModel("dealInfo").callFunction("/isDealLocked",{
	// 			method:"POST", 
	// 			urlParameters:{"DealID" : sObjectId,"LockDeal" : true},
	// 			success: function(oData, response) {
	// 					if( oData.MessageType === 'S' ){
	// 						locked = true;
	// 					}
	// 					else{
	// 						locked = false;
	// 					}
	// 			}, 
	// 			error: function(oError){ 
	// 						console.log(oError);
	// 					},
	// 			async: false
	// 			});

 //           return true;
	// 	},	
	// 	test: function(){
	// 		console.log("testing");
	// 	},	
	// 	/**
	// 	 * Binds the view to the object path and expands the aggregated line items.
	// 	 * @function
	// 	 * @param {sap.ui.base.Event} oEvent pattern match event in route 'object'
	// 	 * @private
	// 	 */
	// 	_onObjectMatched: function(oEvent) {
	// 	   var that = this;
	// 	   var oRb = this.getOwnerComponent().getModel("i18n").getResourceBundle();
	// 	   var sObjectId = oEvent.getParameter("arguments").id;
	// 		sap.ui.core.BusyIndicator.show();
			
	// 		this.getView().getModel("dealInfo").callFunction("/isDealLocked",{
	// 			method:"POST", 
	// 			urlParameters:{"DealID" : sObjectId,"LockDeal" : true},
	// 			success: function(oData, response) {
	// 					if( oData.MessageType === 'S' ){
	// 						that._fetchDealInfo(sObjectId,true);
	// 					}
	// 					else{
	// 						sap.m.MessageBox.information(
	// 							oRb.getText("dealLocked",sObjectId),
	// 								{
	// 									styleClass:"sapUiSizeCompact"
	// 								}
	// 				);
	// 						that._fetchDealInfo(sObjectId,false);
							
	// 					}
	// 			}, 
	// 			error: function(oError){ 
	// 						console.log(oError);
	// 					},
	// 			async: false
	// 		});
	// 	},
		
	// 	_fetchDealInfo: function(sObjectId,setEnabled){
	// 		var that = this;
	// 		this.getView().setModel(this.getOwnerComponent().getModel("dealInfo"), "dealInfo");
	// 		this.getView().getModel("dealInfo").setUseBatch(false);
	// 		this.getView().getModel("dealInfo").read("/DealHeaderSet('" + sObjectId + "')", {
	// 			success: function(oData, oResponse) {
					
	// 				that.getView().byId("Save").setEnabled(setEnabled);
			
	// 				var oODataJSONModel = new sap.ui.model.json.JSONModel();
					
	// 				// set the odata JSON as data of JSON model  
	// 				that.getOwnerComponent().setModel(new JSONModel({
	// 					dealID: sObjectId
	// 				}), "selectedDeal");
					
	// 				// reset message model
	// 				oMessagePopover.destroyItems();
	// 				that.getView().setModel(new JSONModel({
	// 					count: 0
	// 				}), "msgCount");
	// 				that._getMessages(sObjectId);
					
	// 				// store the model
	// 				oODataJSONModel.setData(oData);
	// 				that.getView().setModel(oODataJSONModel, "localModel");
					
	// 		        //refresh Licensee Fee Tab             
	// 			    that.getView().byId("LFeeTab").getController().rebindLicenseeFeeTab();
	// 			    that.getView().byId("LFeeTab").getController().setLicenseeFeeTabEditable(setEnabled);
				
					
	// 				//refresh Rights Tab             
	// 			    that.getView().byId("RightsTab").getController().rebindRightsTab();
	// 				sap.ui.core.BusyIndicator.hide();
	// 			},
	// 			error: function(oError) {
	// 				sap.ui.core.BusyIndicator.hide();
	// 				console.log("Error", oError);
	// 			}
	// 		});
	// 	},

	// 	/**
	// 	 * Binds the view to the object path. Makes sure that detail view displays
	// 	 * a busy indicator while data for the corresponding element binding is loaded.
	// 	 * @function
	// 	 * @param {string} sObjectPath path to the object to be bound to the view.
	// 	 * @private
	// 	 */
	// 	_bindView: function(sObjectPath) {
	// 		// Set busy indicator during view binding
	// 		var oViewModel = this.getModel("detailView");

	// 		// If the view was not bound yet its not busy, only if the binding requests data it is set to busy again
	// 		oViewModel.setProperty("/busy", false);

	// 		this.getView().bindElement({
	// 			path: sObjectPath,
	// 			events: {
	// 				change: this._onBindingChange.bind(this),
	// 				dataRequested: function() {
	// 					oViewModel.setProperty("/busy", true);
	// 				},
	// 				dataReceived: function() {
	// 					oViewModel.setProperty("/busy", false);
	// 				}
	// 			}
	// 		});
	// 	},

	// 	_onBindingChange: function() {
	// 		var oView = this.getView(),
	// 			oElementBinding = oView.getElementBinding();

	// 		// No data for the binding
	// 		if (!oElementBinding.getBoundContext()) {
	// 			this.getRouter().getTargets().display("detailObjectNotFound");
	// 			// if object could not be found, the selection in the master list
	// 			// does not make sense anymore.
	// 			this.getOwnerComponent().oListSelector.clearMasterListSelection();
	// 			return;
	// 		}

	// 		var sPath = oElementBinding.getPath(),
	// 			oResourceBundle = this.getResourceBundle(),
	// 			oObject = oView.getModel().getObject(sPath),
	// 			sObjectId = oObject.HeaderGuid,
	// 			sObjectName = oObject.DealId,
	// 			oViewModel = this.getModel("detailView");

	// 		this.getOwnerComponent().oListSelector.selectAListItem(sPath);

	// 		oViewModel.setProperty("/saveAsTileTitle", oResourceBundle.getText("shareSaveTileAppTitle", [sObjectName]));
	// 		oViewModel.setProperty("/shareOnJamTitle", sObjectName);
	// 		oViewModel.setProperty("/shareSendEmailSubject",
	// 			oResourceBundle.getText("shareSendEmailObjectSubject", [sObjectId]));
	// 		oViewModel.setProperty("/shareSendEmailMessage",
	// 			oResourceBundle.getText("shareSendEmailObjectMessage", [sObjectName, sObjectId, location.href]));
	// 	},

	// 	_getSplitContObj: function() {
	// 		var result = sap.ui.getCore().byId(this.getOwnerComponent().getModel("splitContainerID").getProperty("/id"));
	// 		if (!result) {
	// 			jQuery.sap.log.error("SplitApp object can't be found");
	// 		}
	// 		return result;
	// 	},
	// 	handleMessagePopoverPress: function(oEvent) {

	// 		oMessagePopover.openBy(oEvent.getSource());
	// 	},

	// 	_onMetadataLoaded: function() {
	// 		// Store original busy indicator delay for the detail view
	// 		var iOriginalViewBusyDelay = this.getView().getBusyIndicatorDelay(),
	// 			oViewModel = this.getModel("detailView"),
	// 			oLineItemTable = this.byId("lineItemsList"),
	// 			iOriginalLineItemTableBusyDelay = oLineItemTable.getBusyIndicatorDelay();

	// 		// Make sure busy indicator is displayed immediately when
	// 		// detail view is displayed for the first time
	// 		oViewModel.setProperty("/delay", 0);
	// 		oViewModel.setProperty("/lineItemTableDelay", 0);

	// 		oLineItemTable.attachEventOnce("updateFinished", function() {
	// 			// Restore original busy indicator delay for line item table
	// 			oViewModel.setProperty("/lineItemTableDelay", iOriginalLineItemTableBusyDelay);
	// 		});

	// 		// Binding the view will set it to not busy - so the view is always busy if it is not bound
	// 		oViewModel.setProperty("/busy", true);
	// 		// Restore original busy indicator delay for the detail view
	// 		oViewModel.setProperty("/delay", iOriginalViewBusyDelay);
	// 	},
		
	// 	onSave: function(){
	// 		var that = this;
	// 		var requestBody = {};
			
	// 		var oRb = this.getOwnerComponent().getModel("i18n").getResourceBundle();
	// 		var id = this.getOwnerComponent().getModel("selectedDeal").getProperty("/dealID");
	// 		requestBody.DealID = id;
			
	// 		// License Fee Save
	// 		var LFeeData = this.getView().byId("LFeeTab").getController().getSelectedRow();
	// 		var LFRequest = [];
	// 		for( var i = 0 ; i < LFeeData.oData.length ; i++ ){
	// 			if( LFeeData.oData[i].DealChanged === "true" ){
	// 				var ScopeIDstr = LFeeData.oData[i].ScopeID.toString();
	// 				var LicenseFeePerIncrementstr = LFeeData.oData[i].LicenseFeePerIncrement.toString();
	// 				var NumOfIncrementstr = LFeeData.oData[i].NumOfIncrement.toString();
	// 				LFRequest.push({ DealID: LFeeData.oData[i].DealID ,
	// 								 ItemGuid : LFeeData.oData[i].ItemGuid,
	// 							 	 ScopeID : ScopeIDstr,
	// 								 PeriodID : LFeeData.oData[i].PeriodID,
	// 								 RoyaltyCatg : LFeeData.oData[i].RoyaltyCatg,
	// 								 LicenseFeePerIncrement : LicenseFeePerIncrementstr,
	// 								 NumOfIncrement : NumOfIncrementstr

	// 				});	
	// 			}
	// 		}
			
			
	// 		// Rights Dimension
	// 		var RightsData = this.getView().byId("RightsTab").getController().getSelectedRow();
	// 		var RightsRequest = [];
	// 		for( var i = 0 ; i < RightsData.oData.length ; i++ ){
	// 			if( RightsData.oData[i].DealChanged === "true" ){
	// 				var ScopeIDStr = RightsData.oData[i].ScopeID.toString();
	// 				RightsRequest.push({ DealID: RightsData.oData[i].DealID ,
	// 									 ItemGuid : RightsData.oData[i].ItemGuid,
	// 							 		 ScopeID : ScopeIDStr,
	// 									 PeriodID : RightsData.oData[i].PeriodID,
	// 									 ValidFrom : RightsData.oData[i].ValidFrom,
	//									 ValidFromStatus : RightsData.oData[i].ValidFromStatus,
	// 									 ValidTo : RightsData.oData[i].ValidTo,
	//									 ValidToStatus : RightsData.oData[i].ValidToStatus,
	// 									 Exclusivity : RightsData.oData[i].Exclusivity,
	// 									 RunsUOMUnit1 : RightsData.oData[i].RunsUOMUnit1,
	// 									 RunsUOM1 : RightsData.oData[i].RunsUOM1,
	// 									 RunsUOMUnit2 : RightsData.oData[i].RunsUOMUnit2,
	// 									 RunsUOM2 : RightsData.oData[i].RunsUOM2,
	// 									 RunsUOMUnit3 : RightsData.oData[i].RunsUOMUnit3,
	// 									 RunsUOM3 : RightsData.oData[i].RunsUOM3
	// 				});	
	// 			}
	// 		}
			
			
	// 		// Save Updated Details
	// 		if ( LFRequest.length === 0 && RightsRequest.length === 0 ){

	// 			sap.m.MessageBox.information(
	// 			oRb.getText("noChangeFound"),
	// 				{
	// 					styleClass:"sapUiSizeCompact"
	// 				}
	// 			);
	// 			return;
	// 		}
			
	// 		requestBody.DealLicenseFeeSet = LFRequest;
	// 		requestBody.DealRightsSet = RightsRequest;
			
	// 		this.getView().getModel("dealInfo").setUseBatch(false);
	// 		this.getView().getModel("dealInfo").create("/DealHeaderSet",requestBody, {
	// 			success: function(oData, oResponse) { 
	// 				// console.log(oData); 
	// 				// console.log(oResponse);
	// 				that.getView().byId("LFeeTab").getController().setLicenseeFeeTabEditable(false);
	// 				//that.getView().byId("RightsTab").getController().disableEditRightsTab();

	// 				that.getView().byId("Save").setEnabled(false);
	// 				clearInterval(that.DealLocker);
	// 				sap.m.MessageBox.information(
	// 				oRb.getText("saveSuccessful",id),
	// 					{
	// 						styleClass:"sapUiSizeCompact"
	// 					}
	// 				);
					
	// 			},
	// 			error: function(oData, oResponse) { console.log(oData); console.log(oResponse); alert('Failure'); }
	// 		});
			
	// 	}

	// });
	
});