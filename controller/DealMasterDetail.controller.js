sap.ui.define([
	"wb/cosmos/dealapp/controller/BaseController",
	"sap/ui/model/json/JSONModel"
], function (BaseController,JSONModel) {
	"use strict";

	return BaseController.extend("wb.cosmos.dealapp.controller.DealMasterDetail", {
		
		onBeforeRendering: function() {
			var viewID = this.getView().sId + "--SplitContainer";
		  	this.getOwnerComponent().setModel(new JSONModel({id: viewID}), "splitContainerID");
		}

	});

});