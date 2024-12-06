/**
 *@NApiVersion 2.1
 *@NScriptType Restlet
 *@Description This Script is used to create Vendor from Salesforce to NetSuite.
 */

define(["N/record", "N/log"], function (record, log) {
    const vendorCreatePayload = {
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
    };

    const vendorUpdatePayload = {
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
    };

    const accountVendorMapping = {
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
    };

    const mandatoryFields = ["companyname", "category", "email"];

    const httpMethodValidationObj = {
        "success": "false",
        "error": {
            "message": 'METHOD_NOT_ALLOWED',
            "code": 405,
        }
    };

    const httpBadRequestObj = {
        "success": "false",
        "error": {
            "message": 'BAD_REQUEST',
            "code": 400,
        }
    };

    function _post(context) {
        try {
            log.debug({ title: 'Received Context', details: context });

            if (!context) {
                return httpBadRequestObj;
            }

            const isUpdate = "NetSuite_id" in context;

            if (validatePayload(context, isUpdate)) {
                return httpBadRequestObj;
            }

            if (isUpdate) {
                return updateVendor(context);
            } else {
                return createVendor(context);
            }
        } catch (error) {
            log.error("Error in _post", error);
            return {
                "success": "false",
                "error": {
                    "message": error.message
                }
            };
        }
    }

    function validatePayload(context, isUpdate) {
        const requiredKeys = isUpdate ? Object.keys(vendorUpdatePayload) : Object.keys(vendorCreatePayload);
        for (const key of requiredKeys) {
            if (!context[key]) {
                log.error(`Missing Required Field: ${key}`, context);
                return true;
            }
        }
        return false;
    }

    function createVendor(context) {
        try {
            const createVendorObj = record.create({ type: "vendor" });
            const mappedObject = mapFields(context, accountVendorMapping);
            return saveVendor(createVendorObj, mappedObject);
        } catch (error) {
            log.error("Error during vendor creation", error);
            return {
                "success": "false",
                "error": {
                    "message": error.message
                }
            };
        }
    }

    function updateVendor(context) {
        try {
            const updateVendorObj = record.load({
                type: "vendor",
                id: context.NetSuite_id
            });
            const mappedObject = mapFields(context, accountVendorMapping);
            return saveVendor(updateVendorObj, mappedObject);
        } catch (error) {
            log.error("Error during vendor update", error);
            return {
                "success": "false",
                "error": {
                    "message": error.message
                }
            };
        }
    }

    function mapFields(payload, mapping) {
        const mappedObject = {};
        const addressObject = {};

        for (const key in payload) {
            if (mapping[key]) {
                const mappedKey = mapping[key];
                if (["ShippingCountry", "ShippingStreet", "ShippingCity", "ShippingState", "ShippingPostalCode", "Phone"].includes(key)) {
                    addressObject[mappedKey] = payload[key];
                } else {
                    mappedObject[mappedKey] = payload[key];
                }
            }
        }
        mappedObject.addressArray = [addressObject];
        return mappedObject;
    }

    function saveVendor(vendorObj, mappedObject) {
        try {
            for (const key in mappedObject) {
                if (key === "addressArray") continue;
                vendorObj.setValue({ fieldId: key, value: mappedObject[key] });
            }

            clearAddressBook(vendorObj);
            addAddresses(vendorObj, mappedObject.addressArray);

            const vendorId = vendorObj.save({ enableSourcing: true, ignoreMandatoryFields: true });
            return { "success": "true", "vendorId": vendorId };
        } catch (error) {
            log.error("Error during vendor save", error);
            return {
                "success": "false",
                "error": {
                    "message": error.message
                }
            };
        }
    }

    function clearAddressBook(vendorObj) {
        const lineCount = vendorObj.getLineCount({ sublistId: "addressbook" });
        for (let i = lineCount - 1; i >= 0; i--) {
            vendorObj.removeLine({ sublistId: "addressbook", line: i });
        }
    }

    function addAddresses(vendorObj, addressArray) {
        for (const address of addressArray) {
            vendorObj.selectNewLine({ sublistId: "addressbook" });
            const addressSubrecord = vendorObj.getCurrentSublistSubrecord({ sublistId: 'addressbook', fieldId: 'addressbookaddress' });
            for (const field in address) {
                if (address[field]) {
                    addressSubrecord.setValue({ fieldId: field, value: address[field], ignoreFieldChange: true });
                }
            }
            vendorObj.commitLine({ sublistId: 'addressbook' });
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
    };
});
