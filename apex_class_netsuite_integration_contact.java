public class NetSuiteContactFlowIntegration {

    // Wrapper class for input parameters
    public class FlowInput {
        @InvocableVariable(required=true)
        public Id contactId; // The ID of the Contact record
    }

    // Invocable method to be used in Flow
    @InvocableMethod(label='Trigger NetSuite API for Contact' description='Triggers the NetSuite Suitelet API for the given Contact record.')
    public static void triggerNetSuiteAPI(List<FlowInput> inputs) {
        for (FlowInput input : inputs) {
            try {
                // Validate input
                if (input.contactId == null) {
                    throw new IllegalArgumentException('Contact ID is required.');
                }

                // Fetch Contact details
                Contact contact = [SELECT FirstName, LastName, Email FROM Contact WHERE Id = :input.contactId LIMIT 1];

                // Prepare HTTP request
                HttpRequest req = new HttpRequest();
                req.setEndpoint('https://example.com/suitelet_endpoint'); // Replace with your Suitelet endpoint
                req.setMethod('GET'); // Adjust if POST is needed
                req.setHeader('Content-Type', 'application/json');

                // Add parameters to the endpoint URL
                String params = '?contactId=' + input.contactId + '&firstName=' + contact.FirstName + '&lastName=' + contact.LastName + '&email=' + contact.Email;
                req.setEndpoint(req.getEndpoint() + params);

                // Send HTTP request
                Http http = new Http();
                HttpResponse res = http.send(req);

                // Log the response
                if (res.getStatusCode() == 200) {
                    System.debug('NetSuite API call successful: ' + res.getBody());
                } else {
                    System.debug('NetSuite API call failed: ' + res.getStatusCode() + ' - ' + res.getBody());
                }
            } catch (Exception e) {
                System.debug('Error in NetSuite API call for Contact: ' + e.getMessage());
            }
        }
    }
}
