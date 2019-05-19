
if (typeof (SiebelAppFacade.CSBS_PM) === "undefined") {
	SiebelJS.Namespace("SiebelAppFacade.CSBS_PM");
	define("siebel/custom/CSBS_PM", ["siebel/pmodel"],
		function () {
			SiebelAppFacade.CSBS_PM = (function () {
				
				function CSBS_PM(pm) {
					SiebelAppFacade.CSBS_PM.superclass.constructor.apply(this, arguments);
				}
				
				SiebelJS.Extend(CSBS_PM, SiebelAppFacade.PresentationModel);

				CSBS_PM.prototype.Init = function () {
					SiebelAppFacade.CSBS_PM.superclass.Init.apply(this, arguments);
				}
				
				CSBS_PM.prototype.Setup = function (propSet) {
					SiebelAppFacade.CSBS_PM.superclass.Setup.apply(this, arguments);

					this.AddProperty("ScriptValue", ""); // property to pass field value PM->PR
					bc = this.Get("GetBusComp");
					var sField = "Script"; // hardcoded field name to attach ace plugin
					this.AddProperty("ScriptFieldName", sField);

					// update ace editor value everytime script field value changes
					this.AddMethod("GetFormattedFieldValue", function (control) {
						if (control.GetFieldName() == sField && bc.GetFieldValue(sField) != this.Get("ScriptValue")) {
							this.SetProperty("ScriptValue", bc.GetFieldValue(sField));
						}
					}, {
						sequence: false,
						scope: this
					});
				}
				
				return CSBS_PM;
				
			}());
			return "SiebelAppFacade.CSBS_PM";
		})
}
