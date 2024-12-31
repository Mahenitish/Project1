public class NetSuiteUnifiedFlowIntegration {

    // Wrapper class for input parameters
    public class FlowInput {
        @InvocableVariable(required=true)
        public Id recordId; // The ID of the record (Account, Contact, or Product)

        @InvocableVariable(required=true)
        public String objectType; // The object type: "Account", "Contact", or "Product"
    }

    // Invocable method for Flow
    @InvocableMethod(label='Trigger NetSuite API for Account, Contact, or Product' description='Triggers the NetSuite Suitelet API for the given record.')
    public static void triggerNetSuiteAPI(List<FlowInput> inputs) {
        for (FlowInput input : inputs) {
            if (input.recordId != null && input.objectType != null) {
                // Call future method to perform the HTTP callout
                sw(input.recordId, input.objectType);
            }
        }
    }

    // Future method to handle the callout asynchronously
    @future(callout=true)
    public static void triggerNetSuiteAsync(Id recordId, String objectType) {
        try {
            // Initialize variables for API parameters
            String name = '';
            String additionalParams = '';

            // Fetch details based on the object type
            if (objectType == 'Account') {
                Account account = [SELECT Name, BillingStreet, BillingCity, BillingState, BillingPostalCode, BillingCountry FROM Account WHERE Id = :recordId LIMIT 1];
                name = account.Name;
                additionalParams = '&billingStreet=' + account.BillingStreet + 
                                   '&billingCity=' + account.BillingCity + 
                                   '&billingState=' + account.BillingState + 
                                   '&billingPostalCode=' + account.BillingPostalCode + 
                                   '&billingCountry=' + account.BillingCountry;
            } else if (objectType == 'Contact') {
                Contact contact = [SELECT FirstName, LastName, Email FROM Contact WHERE Id = :recordId LIMIT 1];
                name = contact.FirstName + ' ' + contact.LastName;
                additionalParams = '&email=' + contact.Email;
            } else if (objectType == 'Product') {
                Product2 product = [SELECT Name, ProductCode, Description, Family, IsActive FROM Product2 WHERE Id = :recordId LIMIT 1];
                name = product.Name;
                additionalParams = '&productCode=' + product.ProductCode + 
                                   '&description=' + product.Description + 
                                   '&family=' + product.Family + 
                                   '&isActive=' + product.IsActive;
            } else {
                throw new IllegalArgumentException('Unsupported object type: ' + objectType);
            }

            // Prepare HTTP request
            HttpRequest req = new HttpRequest();
            req.setEndpoint('https://example.com/suitelet_endpoint'); // Replace with your Suitelet endpoint
            req.setMethod('GET'); // Adjust if POST is needed
            req.setHeader('Content-Type', 'application/json');

            // Add parameters to the endpoint URL
            String params = '?recordId=' + recordId + '&objectType=' + objectType + '&name=' + name + additionalParams;
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
            System.debug('Error in NetSuite API call: ' + e.getMessage());
        }
    }
}
