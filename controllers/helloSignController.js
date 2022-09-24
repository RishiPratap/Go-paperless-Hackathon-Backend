var hellosign = require("hellosign-sdk")({
  key: "c9fec5e3c70d8fa2fb91a26c1426c707916de20fed40b2d845aab968b0edc93b",
});
const { db } = require("../firebase");
const { doc, getDoc, updateDoc } = require("firebase/firestore");

hellosign.account.get().then((resp) => {
  console.log(resp);
});

// /hellosign/verifyaccount  -- POST
const verify_account = async (req, res) => {
  // {email}
  hellosign.account
    .verify({ email_address: req.body.email })
    .then((resp) => {
      if (account in resp) {
        res.status(200).send("User Exists");
      } else {
        res.status(500).send("User Does Not Exist");
      }
    })
    .catch((err) => {
      console.log(err.message);
      res.status(500).send(err.message);
    });
};

const create_application = async (req, res) => {
  // {email, application_name, signers(array)}
  email = "ps2644@srmist.edu.in";
  application_name = "ML 3";
  var options = {
    test_mode: 1,
    clientId: "7c6cd4722bf993f3508d03033f104bce",
    subject: "Subject Here",
    title: "Title Here",
    message: "Message Here",
    signers: [
      {
        email_address: "parthusun8@gmail.com",
        name: "Parth",
        order: 0,
      },
      {
        email_address: "rp0256@gmail.com",
        name: "Rishi",
        order: 1,
      },
      {
        email_address: "ps2644@srmist.edu.in",
        name: "Srihari",
        order: 2,
      },
    ],
    file_url: [
      "https://www.dropbox.com/s/1q3aw1wltxpswbl/Parth%20Sundarka%20-%20WhatsApp%20Image%202022-09-15%20at%206.58.06%20PM.jpeg?dl=0",
    ],
  };
  let responseData = {};
  hellosign.signatureRequest
    .createEmbedded(options)
    .then(async (resp) => {
      console.log(resp);
      responseData = resp;
      const docRef = doc(db, `users/${email.split("@")[0]}/Applications/${application_name}`);
      await updateDoc(docRef, {signature_request : responseData.signature_request});
    console.log("Done Successfully");
      res.status(200).send(resp.signature_request);
    })
    .catch((err) => {
      console.log(err);
    });

};

//hellosign/getsignurl
const get_sign_url = async (req, res) => {
  // {email, application_name}
  try{
    const docRef = doc(db, `users/${req.body.email.split("@")[0]}/Applications/${req.body.application_name}`);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      console.log("Document data:", docSnap.data());
      responseData = docSnap.data();
      const signature_id = responseData.signature_request.signatures[responseData.current_hop].signature_id;
      hellosign.embedded.getSignUrl(signature_id).then((resp) => {
        console.log(resp);
        res.status(200).send(resp.embedded.sign_url);
      }).catch(err=>console.log(err));
    }
  }
  catch(err){console.log(err); res.status(500).send(err);}
}

module.exports = {
  verify_account,
  create_application,
  get_sign_url,
};
