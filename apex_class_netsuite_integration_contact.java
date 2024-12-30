public class NetSuiteContactIntegration {

    public static void triggerNetSuiteAPI(List<Id> contactIds) {
        for (Id contactId : contactIds) {
            try {
                // Fetch Contact details
                Contact con = [SELECT Id, FirstName, LastName FROM Contact WHERE Id = :contactId LIMIT 1];

                // Prepare HTTP request
                HttpRequest req = new HttpRequest();
                req.setEndpoint('https://7377593-sb1.extforms.netsuite.com/app/site/hosting/scriptlet.nl?script=670&deploy=1&compid=7377593_SB1&ns-at=AAEJ7tMQuIFXTsDR-g90BsMdbg9qEJNm7roevBA1gvH35nDVCU8');
                req.setMethod('GET'); // Adjust if POST is needed
                req.setHeader('Content-Type', 'application/json');

                // Add parameters
                String params = '?recordId=' + con.Id;
                req.setEndpoint(req.getEndpoint() + params);

                // Send the HTTP request
                Http http = new Http();
                HttpResponse res = http.send(req);

                if (res.getStatusCode() == 200) {
                    System.debug('NetSuite API call successful: ' + res.getBody());
                } else {
                    System.debug('NetSuite API call failed: ' + res.getStatus() + ' ' + res.getBody());
                }
            } catch (Exception e) {
                System.debug('Error in NetSuite API call: ' + e.getMessage());
            }
        }
    }
}
