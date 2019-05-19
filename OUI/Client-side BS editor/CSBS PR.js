
if (typeof (SiebelAppFacade.CSBS_PR) === "undefined") {
	SiebelJS.Namespace("SiebelAppFacade.CSBS_PR");
	define("siebel/custom/CSBS_PR", ["3rdParty/ace/ace", // determines dependencies (path to ace.js file)
									 "siebel/phyrenderer"],
		function () {
			SiebelAppFacade.CSBS_PR = (function () {

				function CSBS_PR(pm) {
					SiebelAppFacade.CSBS_PR.superclass.constructor.apply(this, arguments);
				}

				SiebelJS.Extend(CSBS_PR, SiebelAppFacade.PhysicalRenderer);

				CSBS_PR.prototype.Init = function () {
					SiebelAppFacade.CSBS_PR.superclass.Init.apply(this, arguments);
				}

				CSBS_PR.prototype.ShowUI = function () {
					SiebelAppFacade.CSBS_PR.superclass.ShowUI.apply(this, arguments);

					var pm = this.GetPM(); // to use in global scope functions
					var bc = pm.Get("GetBusComp");
					var sField = pm.Get("ScriptFieldName");

					// get original control
					var oOrig = $("textarea[name='" + pm.Get("GetControls")[sField].GetInputName() + "']");

					// add control for ace editor
					var sNewId = "ace_code_editor";
					SiebelJS.Log($(oOrig).parent().after('<div id="' + sNewId + '"></div>'));
					var oNew = $("#" + sNewId);

					// attach ace editor
					var oAce = ace.edit(sNewId);
					oAce.setTheme("ace/theme/monokai");
					oAce.getSession().setMode("ace/mode/javascript");
					oAce.$blockScrolling = Infinity;

					// to be replaced with css file
					oNew.css("height", oOrig.height() + "px"); // copy control height 
					oOrig.remove(); // remove orig control
					$("#s_" + pm.Get("GetFullId") + "_div").find(".mceLabel").remove(); // remove labels

					// copy value from ace editor into the field
					oAce.getSession().on('change', function () {
						bc.SetFieldValue(sField, oAce.getValue());
					});

					// copy field value to ace editor
					this.AttachPMBinding("ScriptValue", function () {
						field_value = pm.Get("ScriptValue");
						if (field_value != oAce.getValue()) {
							oAce.setValue(field_value);
							oAce.gotoLine(1); // first line by default
						}
					});
				}

				CSBS_PR.prototype.BindEvents = function () {
					SiebelAppFacade.CSBS_PR.superclass.BindEvents.apply(this, arguments);
				}

				CSBS_PR.prototype.BindData = function () {
					SiebelAppFacade.CSBS_PR.superclass.BindData.apply(this, arguments);
				}

				return CSBS_PR;
			}());
			return "SiebelAppFacade.CSBS_PR";
		})
}