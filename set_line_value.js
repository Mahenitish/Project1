/**
 *@NApiVersion 2.1
 *@NScriptType ClientScript
 * File Header
 * Created On : 
 * Modified On: 
 * Modified By: 
 * Description:  
*/
define([],
    function () {
        function fieldChanged(context) {

            var currentRec = context.currentRecord;

            if (context.fieldId == "subsidiary") {
                var subsidiary = currentRec.getValue({
                    fieldId: "subsidiary"
                });
                var lineCount = currentRec.getLineCount({ sublistId: 'item' });
                for (var i = 0; i < lineCount; i++) {
                    currentRec.selectLine({ sublistId: 'item', line: i });
                    var mandatoryField = currentRec.getCurrentSublistField({ sublistId: 'item', fieldId: 'your_field_id' });
                    if (subsidiary == 'desired_subsidiary_id') {
                        currentRec.setCurrentSublistValue({
                            sublistId: 'item',
                            fieldId: 'item',
                            value: ""
                        });
                        mandatoryField.isMandatory = true;
                        currentRec.commitLine({
                            sublistId: 'item'
                        });
                    }
                }
            }
        }
        return {
            fieldChanged: fieldChanged
        }
    });