@isTest
public class AccountTriggerTest {

    @isTest
    static void testAccountTrigger() {
        // Mocking HTTP callout
        Test.startTest();
        Test.setMock(HttpCalloutMock.class, new MockHttpResponseGenerator());

        // Test Insert
        Account acc = new Account(Name = 'Test Account', Integration_Status__c = 'Ready for Integration');
        insert acc;

        // Test Update
        acc.Integration_Status__c = 'Pending';
        update acc;

        acc.Integration_Status__c = 'Ready for Integration';
        update acc;

        Test.stopTest();
    }

    public class MockHttpResponseGenerator implements HttpCalloutMock {
        public HttpResponse respond(HttpRequest req) {
            HttpResponse res = new HttpResponse();
            res.setHeader('Content-Type', 'application/json');
            res.setBody('{"status": "success"}');
            res.setStatusCode(200);
            return res;
        }
    }
}
