# Paytm-Firebase-Cloud-Function
###A Production Ready Firebase cloud function to handle Paytm Transaction Token Generation

Just make a HTTP request from the client side and receive a Paytm Transaction Token.

It follows the docs of [Initiate Transaction API](https://developer.paytm.com/docs/initiate-transaction-api/)

The HTTP request should contain Paytm Merchant ID - MID, ORDER_ID, TXN_Amount, Customer ID, mode.

| Params | Type | Required |
|---	 |---	|---	   |	
| MID | String | Yes |
| ORDER_ID | String | Yes |
| TXN_AMOUNT | String | Yes |
| CUST_ID | String | Yes |
| CALLBACK_URL | String | Optional |
| mode | String | Optional |
