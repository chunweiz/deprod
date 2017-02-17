sap.ui.define([
	"wb/cosmos/dealapp/controller/BaseController",
	"sap/ui/model/json/JSONModel"
], function(BaseController, JSONModel) {
	"use strict";

	return BaseController.extend("wb.cosmos.dealapp.controller.App", {

		onInit: function() {
			$(document).on("keydown", function (e) {
			    if (e.which === 8 && !$(e.target).is("input:not([readonly]):not([type=radio]):not([type=checkbox]), textarea, [contentEditable], [contentEditable=true]")) {
			        e.preventDefault();
			    }
			});
			
			var oViewModel,
			    that = this,
				fnSetAppNotBusy,
				oListSelector = this.getOwnerComponent().oListSelector,
				iOriginalBusyDelay = this.getView().getBusyIndicatorDelay();

			oViewModel = new JSONModel({
				busy: true,
				delay: 0
			});
			this.setModel(oViewModel, "appView");
			this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());

			fnSetAppNotBusy = function() {
				oViewModel.setProperty("/busy", false);
				oViewModel.setProperty("/delay", iOriginalBusyDelay);
			};
    			
    			var userFormat = new JSONModel();
    			userFormat.loadData("/sap/bc/zxsjs_proxy?cmd=getUserFormat","",false); 
    			this.getOwnerComponent().setModel(new JSONModel({
					GrpSep :userFormat.oData.DATA.GRPSEP,
					DecSep :userFormat.oData.DATA.DECSEP,
					DateFormat : userFormat.oData.DATA.DATEFORMAT 
					}), "userFormatting");
			// this.getOwnerComponent().getModel("dealUserFormat").read("/UserFormatSet", {
			// 	async : false,
			// 	success: function(oData) {
			// 		that.getOwnerComponent().setModel(new JSONModel({
			// 		GrpSep : oData.results[0].GrpSep,
			// 		DecSep : oData.results[0].DecSep
			// 		}), "userFormatting");
	
			// 	},
			// 	error: function(oError) {
			// 		console.log(oError); 
			// 	}
			// });

		}

	});

});