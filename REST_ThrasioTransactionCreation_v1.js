// Generic Restlet Script used to create transaction in NetSuite

/**
 *@NApiVersion 2.1
 *@NScriptType Restlet
 */
 define(['N/record', 'N/format', 'N/log', 'N/search'], function(record, format, log, search) {
    function REST_CreateTransaction(context) {
        try {
            log.debug("Start")
            var transactionArr = []
            var _TRAN_ID = "";
            var recordType = context.recordtype;
            var correlationid = context.correlationId;
            var sourceSystemMessage = context.sourcesystem;
            var trandate = context.trandate;
            var sucessAndErrorObject = {}
            var transactionBody = context.body;
            sucessAndErrorObject["custrecord_iris_payload"] = JSON.stringify(context); // Creating sucessAndErrorObject for creating IRIS Inbound Message Record to set Payload value
            var metadata = {}
            var keys = Object.keys(context);
            for (var x = 0; x < keys.length; x++) {
                if (keys[x] != "lines") {
                    metadata[keys[x]] = context[keys[x]]
                }
            }
            sucessAndErrorObject["custrecord_iris_metadata"] = JSON.stringify(metadata); // Creating sucessAndErrorObject for creating IRIS Inbound Message Record to set Meta Data value
            var objRecord = record.create({
                type: recordType,
                isDynamic: false
            });

            if (transactionBody) {
                setBody(transactionBody, objRecord);
            }

            var linename = context.linename;
            var lines = context.lines
            var lineCommited = false;

            setTranLines(lines, lineCommited, linename, objRecord);

            log.debug({
                title: "lineCommited",
                details: lineCommited
            })

            var transactionID = objRecord.save({
                enableSourcing: true,
                ignoreMandatoryFields: true,
                disabletriggers: false
            });

            sucessAndErrorObject["custrecord_iris_transaction_link"] = transactionID; // Creating sucessAndErrorObject for creating IRIS Inbound Message Record to set Invenory Adjustment Record Link value
            log.debug({
                title: "transaction created",
                details: transactionID
            })

            transactionArr.push(transactionID)
            var fieldLookUp = search.lookupFields({
                type: recordType,
                id: transactionID,
                columns: ['tranid', 'externalid']
            });
            log.debug("fieldLookUp", JSON.stringify(fieldLookUp))
            _TRAN_ID = fieldLookUp.tranid;
            if (correlationid) {
                sucessAndErrorObject["custrecord_iris_correlation_id"] = correlationid; // Creating sucessAndErrorObject for creating IRIS Inbound Message Record to set Correlation Id value
            }
            if (sourceSystemMessage) {
                sucessAndErrorObject["custrecord_source_system"] = sourceSystemMessage; // Creating sucessAndErrorObject for creating IRIS Inbound Message Record to set Source System Message value
            }

            // Check the condition whether at least one transaction created for displaying the success message
            if (transactionArr.length > 0) {
                createLogRecord(sucessAndErrorObject)
                log.debug('NS Response:', 'success:' + 'true' + ',' + 'documentNumber:' + _TRAN_ID + ',' + 'internalId:' + transactionArr[0])
                return ({
                    success: true,
                    documentNumber: _TRAN_ID,
                    internalId: transactionArr[0],
                })
            } else {
                sucessAndErrorObject["custrecord_iris_note"] = JSON.stringify({
                    success: false,
                    reason: "No transactions been created in system, Please check with netsuite administrator",
                })
                createLogRecord(sucessAndErrorObject)
                return ({
                    success: false,
                    reason: "No transactions been created in system, Please check with netsuite administrator",
                })
            }
        } catch (e) {
            sucessAndErrorObject["custrecord_iris_note"] = JSON.stringify(e)
            createLogRecord(sucessAndErrorObject)
            return ({
                success: false,
                messageDetail: e.message,
            })
        }
    }

    // This function used to create Custom Record for future reference purpose
    function createLogRecord(sucessAndErrorObject) {
        var recordObj = record.create({
            type: "customrecord_iris_inbound_message"
        })
        var flagSubmited = false;
        for (var value in sucessAndErrorObject) {
            recordObj.setValue(value, sucessAndErrorObject[value]);
            flagSubmited = true;
        }
        if (flagSubmited == true) {
            recordObj.save()
        }
    }

    // This function used to set Body Level fields on Transaction 
    function setBody(transactionBody, objRecord) {
        for (var value in transactionBody) {
            if (value == "trandate") {
                var trandate = format.parse({
                    value: transactionBody[value],
                    type: format.Type.DATE
                })
                objRecord.setValue(value, trandate)
            } else {
                if (isNumeric(transactionBody[value])) {
                    objRecord.setValue(value, transactionBody[value])
                } else {
                    objRecord.setText({
                        fieldId: value,
                        text: transactionBody[value].toString()
                    });
                }
            }
        }
    }

    // This function used to set Line Level fields on Transaction 
    function setTranLines(lines, lineCommited, linename, objRecord) {
        var itemIdObj = getItemId(lines)
        log.debug("item Object",itemIdObj)
        //Avinash: 
        /*
         Ppayload Items Loop starts 
         str += '+ SKU_NAME +'
         Loop ends

         run search on Items
        filter: "formulatext: CASE when name IN("+ str +") then 'T' else 'F' end
                 Operator: 'equalto'
                 value: 'T'
        loop throough search result and build the JSON
        Resultset =
         {
           'itemsnm_1' : 123, //internalID 
           'itemsnm_2' : 345 //internalID
         }
     
         
        */
        for (var x = 0; x < lines.length; x++) {
            var itemLineObj = lines[x];
            for (var key in itemLineObj) {

                if (key == 'item') {
                //    log.debug("Item Internal ID",itemIdObj[itemLineObj[key].toUpperCase()])
                   // var itemInternalid = getItemInternalID(itemLineObj[key])// replace this with Resultset[itemLineObj[key]]
                   var itemInternalid = itemIdObj[itemLineObj[key].toUpperCase()]
                   if (itemInternalid) {
                        objRecord.setSublistValue({
                            sublistId: linename,
                            fieldId: key,
                            value: Number(itemInternalid),
                            line: x
                        });
                    }
                } else {
                    if (isNumeric(itemLineObj[key])) {
                        objRecord.setSublistValue({
                            sublistId: linename,
                            fieldId: key,
                            value: itemLineObj[key],
                            line: x
                        });
                    } else {
                        objRecord.setSublistText({
                            sublistId: linename,
                            fieldId: key,
                            text: itemLineObj[key].toString(),
                            line: x
                        });
                    }
                }
            }
            lineCommited = true;
        }
    }

    function getItemId(lines){
        let itemsArray = []
        let itemObj = {}
        for(let k = 0;k < lines.length; k++){
            itemsArray.push(lines[k].item.toUpperCase())
        }
        // log.debug("Line Items",itemsArray)

        var itemList = itemsArray.map(s => `'${s}'`).join(',');

        var result = search.create({
            type: "item",
            filters:
            [
               [`formulatext: case when UPPER({name}) IN (${itemList}) then 'T' else 'F' end`,"is","T"],
               "AND",
               ["isinactive","is","F"]
            ],
            columns:
            [
               search.createColumn({name: "internalid", label: "Internal ID"}),
               search.createColumn({
                name: "itemid",
                sort: search.Sort.ASC,
                label: "Name"
             })
            ]
         }).run().getRange(0,1000)
         result.forEach((element)=>{
            itemObj[element.getValue("itemid").toUpperCase()]=element.id
         })        
         return itemObj
    }

    function isNumeric(str) {
        return !isNaN(parseFloat(str)) && isFinite(str);
    }
    return {
        post: REST_CreateTransaction
    };
});