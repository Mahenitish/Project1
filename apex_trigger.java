trigger AccountTrigger on Account (after insert, after update) {
    // Collect Account IDs for API trigger
    List<Id> accountIdsForIntegration = new List<Id>();

    if (Trigger.isInsert) {
        // Check new records for Integration Status
        for (Account acc : Trigger.new) {
            if (acc.Integration_Status__c == 'Ready for Integration') {
                accountIdsForIntegration.add(acc.Id);
            }
        }
    } else if (Trigger.isUpdate) {
        // Check updated records for Integration Status changes
        for (Account acc : Trigger.new) {
            Account oldAcc = Trigger.oldMap.get(acc.Id);
            if (acc.Integration_Status__c == 'Ready for Integration' &&
                oldAcc.Integration_Status__c != 'Ready for Integration') {
                accountIdsForIntegration.add(acc.Id);
            }
        }
    }

    // Call NetSuite API for eligible Accounts
    if (!accountIdsForIntegration.isEmpty()) {
        NetSuiteIntegration.triggerNetSuiteAPI(accountIdsForIntegration);
    }
}
