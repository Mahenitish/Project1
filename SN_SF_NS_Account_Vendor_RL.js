/**
 *@NApiVersion 2.1
 *@NScriptType Restlet
 *@Description This Script is used to create Vendor from Salesforce to NetSuite.
 */
/*
 Script Modification Log:
 -- Date --         -- Modified By --           --Requested By--      --Ticket Number             -- Description --

 */

define(["N/record"], function (record) {
    //This payload is for Project Create
    var vendor_create_payload = {
        "Name": "XYZ pvt ltd",
        "Id": "cvbns45wb",
        "MBDSFA_Payment_Category__c": "Monthly Publishers",
        "MBDSFA_Email__c": "abc@gmail.com",
        "Website": "abc.com",
        "ShippingCountry": "USA",
        "ShippingStreet": "123 street",
        "ShippingCity": "New York",
        "ShippingState": "New York",
        "ShippingPostalCode": "10000",
        "Phone": "23684912"
    }
    //This payload is for vendor Update
    var vendor_update_payload = {
        "NetSuite_id": "",
        "Name": "XYZ pvt ltd",
        "Id": "cvbns45wb",
        "MBDSFA_Payment_Category__c": "Monthly Publishers",
        "MBDSFA_Email__c": "abc@gmail.com",
        "Website": "abc.com",
        "ShippingCountry": "USA",
        "ShippingStreet": "123 street",
        "ShippingCity": "New York",
        "ShippingState": "New York",
        "ShippingPostalCode": "10000",
        "Phone": "23684912"
    }
    //Account to vendor SF-NS mapping
    var account_vendor__mapping = {
        "NetSuite_id": "",
        "Name": "companyname",
        "Id": "custentity_salesforce_id",
        "MBDSFA_Payment_Category__c": "category",
        "MBDSFA_Email__c": "email",
        "Website": "url",
        "ShippingCountry": "country",
        "ShippingStreet": "addr1",
        "ShippingCity": "city",
        "ShippingState": "state",
        "ShippingPostalCode": "zip",
        "Phone": "addrphone"
    }

    //Manadatory fields
    var manadatoryFields = {
        'companyname': '',
    }

    var httpMethodValidationObj = {
        "success": "false",
        "error": {
            "message": 'METHOD_NOT_ALLOWED',
            "code": 405,
        }
    };
    var httpMethodValidationPayload = {
        "success": "false",
        "error": {
            "message": 'BAD_REQUEST',
            "code": 400,
        }
    };
    function _post(context) {
        try {
            log.debug({ title: 'context', details: context })
            if (validatePayload(context) == true) {
                return httpMethodValidationPayload;
            }
            else {
                if ("NetSuite_id" in context) {//Vendor update case
                    try {
                        var updateVendorObj = record.load({
                            type: "vendor",
                            id: context.NetSuite_id
                        });
                        var mappedObject = getAccountMappedField(context, account_vendor__mapping);

                        saveVendor(updateVendorObj, mappedObject);
                    } catch (error) {
                        log.error("error during vendor update", error);
                        return {
                            "success": "false",
                            "error": {
                                "message": error.message
                            }
                        }
                    }
                }
                else {// Vendor create case
                    try {
                        var createVendorObj = record.create({
                            type: "vendor"
                        });
                        var mappedObject = getAccountMappedField(context, account_vendor__mapping);
                        saveVendor(createVendorObj, mappedObject);
                    } catch (error) {
                        log.error("error during vendor create", error);
                        return {
                            "success": "false",
                            "error": {
                                "message": error.message
                            }
                        }
                    }
                }
            }
        } catch (e) {
            log.error("error", error);
            return {
                "success": "false",
                "error": {
                    "message": error.message
                }
            }
        }

    }
    function validatePayload(context) {
        var validatePayload = false;
        if ("NetSuite_id" in context) {
            for (var key in vendor_update_payload) {
                if (!(key in context)) {
                    validatePayload = true;
                }
            }
        }
        else {
            for (var key in vendor_create_payload) {
                if (!(key in context)) {
                    validatePayload = true;
                }
            }
        }
        return validatePayload;
    }
    function getAccountMappedField(vendor_create_payload, account_vendor__mapping) {
        var mappedObject = {};
        var addressArray = [];

        // Create the mapped object and address array
        for (var key in vendor_create_payload) {
            if (vendor_create_payload.hasOwnProperty(key) && account_vendor__mapping.hasOwnProperty(key)) {
                var newKey = account_vendor__mapping[key];
                if (["ShippingCountry", "ShippingStreet", "ShippingCity", "ShippingState", "ShippingPostalCode", "Phone"].includes(key)) {
                    addressArray.push({ [newKey]: vendor_create_payload[key] });
                } else {
                    mappedObject[newKey] = vendor_create_payload[key];
                }
            }
        }

        // Combine address fields into a single object and push to addressArray
        var addressObject = {};
        addressArray.forEach(function (item) {
            var key = Object.keys(item)[0];
            addressObject[key] = item[key];
        });
        mappedObject.addressArray = [addressObject];
        log.debug("mappedObject", mappedObject);
        return mappedObject;
    }
    function saveVendor(vendorObj, mappedObject) {
        try {


            for (var prop in mappedObject) {
                if (Array.isArray(mappedObject[prop])) {
                    break
                } else {
                    vendorObj.setValue({ fieldId: prop, value: mappedObject[prop] });
                }
            }
            var linecount = vendorObj.getLineCount({
                sublistId: "addressbook",
            });
            log.debug('Address linecount :', linecount)
            if (linecount > 0) {
                for (var index = linecount - 1; index >= 0; index--) {
                    vendorObj.removeLine({
                        sublistId: "addressbook",
                        line: index,
                    });

                }
            }
            for (var i = 0; i < mappedObject.addressArray.length; i++) {
                var addressObj = mappedObject.addressArray[i];
                vendorObj.selectNewLine({ sublistId: 'addressbook' })
                //log.debug('---SELECT LINE----')

                var myAddressSubRecord = vendorObj.getCurrentSublistSubrecord({ sublistId: 'addressbook', fieldId: 'addressbookaddress' });
                //log.debug('myAddressSubRecord :', myAddressSubRecord)

                if (addressObj.hasOwnProperty("ShippingAddress")) {
                    vendorObj.setCurrentSublistValue({ sublistId: 'addressbook', fieldId: 'defaultbilling', value: false });
                    vendorObj.setCurrentSublistValue({ sublistId: 'addressbook', fieldId: 'defaultshipping', value: true });

                    var shippingAddress = addressObj.ShippingAddress;
                    //log.debug('shippingAddress :', shippingAddress)
                    for (var ship_add in shippingAddress) {
                        if (!is_empty(shippingAddress[ship_add])) {
                            // log.debug('----')
                            // log.debug('ship_add :',ship_add)
                            log.debug('shippingAddress[ship_add]:', shippingAddress[ship_add])
                            myAddressSubRecord.setValue({
                                fieldId: ship_add, value: shippingAddress[ship_add], ignoreFieldChange: true
                            })
                        }
                    }

                }
                vendorObj.commitLine({ sublistId: 'addressbook' });
            }
            log.debug('--GOING TO SAVE---')
            var vendorId = vendorObj.save({
                enableSourcing: true,
                ignoreMandatoryFields: true
            });
            log.audit('vendorId :', vendorId);
        } catch (error) {
            log.error("error during vendor data process", error);
            return {
                "success": "false",
                "error": {
                    "message": error.message
                }
            }
        }
    }
    function _get(context) {
        return httpMethodValidationObj;
    }
    function _put(context) {
        return httpMethodValidationObj;
    }

    function _delete(context) {
        return httpMethodValidationObj;
    }

    return {
        get: _get,
        post: _post,
        put: _put,
        delete: _delete
    }
});
