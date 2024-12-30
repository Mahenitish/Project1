public class NetSuiteIntegration {

    public static void triggerNetSuiteAPI(List<Id> accountIds) {
        for (Id accountId : accountIds) {
            try {
                // Fetch Account details
                Account account = [SELECT Id, Name FROM Account WHERE Id = :accountId LIMIT 1];

                // Prepare HTTP request
                HttpRequest req = new HttpRequest();
                req.setEndpoint('https://example.com/suitelet_endpoint'); // Replace with Suitelet URL
                req.setMethod('GET'); // Adjust if POST is needed
                req.setHeader('Content-Type', 'application/json');

                // Add parameters
                String params = '?recordId=' + account.Id;
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
