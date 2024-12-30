trigger ContactTrigger on Contact (after insert, after update) {
    // Collect Contact IDs for API trigger
    List<Id> contactIdsForIntegration = new List<Id>();

    if (Trigger.isInsert) {
        // Check new records for Integration Status
        for (Contact con : Trigger.new) {
            if (con.Integration_Status__c == 'Ready for Integration') {
                contactIdsForIntegration.add(con.Id);
            }
        }
    } else if (Trigger.isUpdate) {
        // Check updated records for Integration Status changes
        for (Contact con : Trigger.new) {
            Contact oldCon = Trigger.oldMap.get(con.Id);
            if (con.Integration_Status__c == 'Ready for Integration' &&
                oldCon.Integration_Status__c != 'Ready for Integration') {
                contactIdsForIntegration.add(con.Id);
            }
        }
    }

    // Call NetSuite API for eligible Contacts
    if (!contactIdsForIntegration.isEmpty()) {
        NetSuiteContactIntegration.triggerNetSuiteAPI(contactIdsForIntegration);
    }
}
