const functions = require("firebase-functions");
const PaytmChecksum = require("./PaytmChecksum");
var axios = require("axios");

/* Find your Merchant Key in your Paytm Dashboard at https://dashboard.paytm.com/next/apikeys */

var TEST_MERCHANT_KEY = "XXXXXXXXXXXX";
var PROD_MERCHANT_KEY = "XXXXXXXXXXXX";

exports.paytmTxnToken = functions
    .region("asia-east2") //can ommit region if you're not sure
    .https.onRequest((request, response) => {
        functions.logger.info("Hello paytmTxnToken!", { structuredData: true });

        var paytmParams = {};

        /* check if request contains data */
        if (
            request.body &&
            request.body.MID &&
            request.body.ORDER_ID &&
            request.body.TXN_AMOUNT &&
            request.body.CUST_ID
        ) {
            paytmParams = {
                requestType: "Payment",
                mid: request.body.MID,
                websiteName: "WEBSTAGING",
                orderId: request.body.ORDER_ID,
                callbackUrl: request.body.CALLBACK_URL,
                txnAmount: {
                    value: request.body.TXN_AMOUNT,
                    currency: "INR",
                },
                userInfo: {
                    custId: request.body.CUST_ID,
                },
            };

            /**
             * Generate checksum by parameters we have
             * Find your Merchant Key in your Paytm Dashboard at https://dashboard.paytm.com/next/apikeys
             */

            var paytmChecksum = PaytmChecksum.generateSignature(
                JSON.stringify(paytmParams),
                TEST_MERCHANT_KEY
            );

            if (
                request.body &&
                request.body.mode &&
                request.body.mode === "Production"
            ) {
                paytmChecksum = PaytmChecksum.generateSignature(
                    JSON.stringify(paytmParams),
                    PROD_MERCHANT_KEY
                );
            }

            paytmChecksum
                .then((result) => {
                    console.log("generateSignature Returns: " + result);

                    var post_data = {
                        body: paytmParams,
                        head: { signature: result },
                    };

                    let paytmInitTransactionAPIUrl = `https://securegw-stage.paytm.in/theia/api/v1/initiateTransaction?mid=${paytmParams.mid}&orderId=${paytmParams.orderId}`;

                    if (
                        request.body &&
                        request.body.mode &&
                        request.body.mode === "Production"
                    ) {
                        paytmInitTransactionAPIUrl = `https://securegw.paytm.in/theia/api/v1/initiateTransaction?mid=${paytmParams.mid}&orderId=${paytmParams.orderId}`;
                    }
                    return axios
                        .post(paytmInitTransactionAPIUrl, post_data)
                        .then((res) => {
                            //console.log(res);
                            console.log(res.data);
                            return response.send(res.data);
                        })
                        .catch((err) => {
                            console.log(err);
                            response.status(500).send(err);
                        });
                })
                .catch((error) => {
                    console.log(error);
                    response.status(500).send(error);
                });
        } else {
            response
                .status(401)
                .send("No data provided! Failed to verify checksum!");
        }
    });
