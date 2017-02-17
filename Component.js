sap.ui.define([
    	"sap/ui/core/UIComponent",
    	"sap/ui/model/json/JSONModel"
    ], function (UIComponent, JSONModel) {
    	"use strict";
     
    	return UIComponent.extend("wb.cosmos.dealapp.Component", {
     
    		metadata : {
    			manifest: "json"
    		},
     
    		init : function () {
    			// call the init function of the parent
    			UIComponent.prototype.init.apply(this, arguments);
    			this.getRouter().initialize();

    			
    			$(document).unbind('keydown').bind('keydown', function (event) {
    				
				    if (event.keyCode === 8) {
				    	
				        var doPrevent = true;
				        var types = ["text", "password", "file", "search", "email", "number", "date", "color", "datetime", "datetime-local", "month", "range", "search", "tel", "time", "url", "week"];
				        var d = $(event.srcElement || event.target);
				        var disabled = d.prop("readonly") || d.prop("disabled");
				        if (!disabled) {
				            if (d[0].isContentEditable) {
				                doPrevent = false;
				            } else if (d.is("input")) {
				                var type = d.attr("type");
				                if (type) {
				                    type = type.toLowerCase();
				                }
				                if (types.indexOf(type) > -1) {
				                    doPrevent = false;
				                }
				            } else if (d.is("textarea")) {
				                doPrevent = false;
				            }
				        }
				        if (doPrevent) {
				            event.preventDefault();
				            return false;
				        }
				    }
				});
    		},
    		
    		getContentDensityClass : function() {
				if (!this._sContentDensityClass) {
					if (!sap.ui.Device.support.touch) {
						this._sContentDensityClass = "sapUiSizeCompact";
					} else {
						this._sContentDensityClass = "sapUiSizeCozy";
					}
				}
				return this._sContentDensityClass;
			}
    	});
     
    });