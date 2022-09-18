var hellosign = require("hellosign-sdk")({
  key: "184039ac5e805cbe90c38d0667ea7c318183095b4cb793218848898a8e6b0088",
});

hellosign.account.get().then((resp) => {console.log(resp);});


// /hellosign/verifyaccount  -- POST
const verify_account = async (req, res) => {
  // {email}
  hellosign.account
    .verify({ email_address: req.body.email })
    .then((resp) => {
      if (account in resp) {
        res.status(200).send("User Exists");
      } else{
        res.status(500).send("User Does Not Exist");
      }
    })
    .catch((err) => {
      console.log(err.message);
      res.status(500).send(err.message);
    });
};



