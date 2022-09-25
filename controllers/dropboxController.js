var fetch = require("isomorphic-fetch");
var Dropbox = require("dropbox").Dropbox;
const { db } = require("../firebase");
const {
  getDocs,
  getDoc,
  collection,
  doc,
  setDoc,
} = require("firebase/firestore");
var hellosign = require("hellosign-sdk")({
  key: "c9fec5e3c70d8fa2fb91a26c1426c707916de20fed40b2d845aab968b0edc93b",
});

// dropbox/viewapplication  -- POST
const viewApplications = async (req, res) => {
  // {email}
  try {
    const colRef = collection(
      db,
      `users/${req.body?.email.split("@")[0]}/Applications`
    );
    const colRef2 = collection(
      db,
      "users",
      req.body?.email.split("@")[0],
      "Inbox"
    );
    const docSnap = await getDocs(colRef);
    const inboxSnap = await getDocs(colRef2);
    const docList = docSnap.docs.map((doc) => doc.data());
    const inboxList = inboxSnap.docs.map((doc) => doc.data());
    console.log("DocList", docList);
    console.log("DocList", inboxList);

    const applications = [];
    docList.forEach((doc) => {
      applications.push({ name: doc.alias, status: doc.status });
    });
    inboxList.forEach((doc) => {
      applications.push({
        name: doc.application_name,
        requester: doc.requester,
        status: "Inbox",
      });
    });
    console.log(applications);
    res.status(200).send(applications);
  } catch (err) {
    console.log(err);
  }
};

//dropbox/getprogress  -- POST
const getFileList = async (req, res) => {
  //{acessToken, path}
  console.log(req.body);
  const refPath = `users/${req.body.email.split("@")[0]}/Applications/${
    req.body.path
  }`;
  const docRef = doc(db, refPath);
  // console.log(docRef);
  const userSnapshot = await getDoc(docRef);
  const data_user = userSnapshot.data();

  let response = {
    current_hop: data_user.current_hop,
    total_hops: data_user.total_signers,
    signers: data_user.signers,
    files: [],
  };
  var dbx = new Dropbox({ accessToken: req.body?.accessToken, fetch: fetch });
  dbx
    .filesListFolder({
      path: "/" + req.body?.path,
    })
    .then(async (resp) => {
      console.log(resp?.result?.entries);
      const data = await resp?.result?.entries;
      // response.files = data;
      data.forEach((file) => {
        response.files.push(file.name);
      });
      res.status(200).send(response);
    })
    .catch((err) => {
      // console.log(err.error);
      const errorMsg = err.error;
      console.log(errorMsg);
      res.status(500).send(errorMsg);
    });
};

//dropbox/createapplication  -- POST
const createApplication = async (req, res) => {
  // {accessToken, appName, signers(array), email}
  req.body.signers = [req.body.email, ...req.body.signers];
  console.log(req.body);
  var dbx = new Dropbox({ accessToken: req.body?.accessToken, fetch: fetch });
  dbx
    .fileRequestsCreate({
      title: req.body?.appName,
      destination: "/" + req.body?.appName,
    })
    .then(async (resp) => {
      console.log(resp);
      res.status(200).send(resp.result.url);

      // HELLOSIGN
      var options = {
        test_mode: 1,
        clientId: "7c6cd4722bf993f3508d03033f104bce",
        subject: "Subject Here",
        title: "Title Here",
        message: "Message Here",
        signers: [],
        file_url: [
          "https://www.dropbox.com/s/1q3aw1wltxpswbl/Parth%20Sundarka%20-%20WhatsApp%20Image%202022-09-15%20at%206.58.06%20PM.jpeg?dl=0",
        ],
      };
      for (let i = 0; i < req.body.signers.length; i++) {
        options.signers.push({
          email_address: req.body.signers[i],
          order: i,
          name: req.body.signers[i].split("@")[0],
        });
      }
      let helloData = {};
      await hellosign.signatureRequest.createEmbedded(options).then(async (resp) => {
        console.log(resp);
        helloData = resp.signature_request;
        console.log("Done Successfully");
      });

      // ADD FIREBASE CODE HERE
      const docRef = doc(
        db,
        `users/${req.body?.email.split("@")[0]}/Applications/${
          req.body?.appName
        }`
      );
      const application_details = {
        url: resp.result?.url,
        total_signers: req.body?.signers.length,
        signers: req.body?.signers,
        status: "Pending",
        alias: req.body?.appName,
        current_hop: 0,
        signature_request: helloData,
      };
      console.log(application_details);
      await setDoc(docRef, application_details);
    })
    .catch((err) => {
      console.log("Error", err?.message);
      res.status(500).send(err?.message);
    });
};

//dropbox/downloadfile  -- POST
const downloadFile = async (req, res) => {
  // {accessToken, path}
  var dbx = new Dropbox({ accessToken: req.body?.accessToken, fetch: fetch });
  dbx
    .filesDownloadZip({
      path: req.body?.path,
    })
    .then((resp) => {
      console.log(resp);
      res.status(200).send(resp.result.fileBinary);
    })
    .catch((err) => {
      console.log(err?.message);
      res.status(500).send(err?.message);
    });
};

// dropbox/getfilebinary  -- POST
const downloadIndividualFile = async (req, res) => {
  console.log(req.body);
  try {
    var dbx = new Dropbox({ accessToken: req.body?.accessToken, fetch: fetch });
    dbx
      .filesDownload({
        path: req.body?.path,
      })
      .then((resp) => {
        console.log(resp);
        res.status(200).send(resp.result.fileBinary);
      })
      .catch((err) => {
        console.log(err?.message);
        res.status(500).send(err?.message);
      });
  } catch (err) {
    console.log(err.message);
    res.status(500).send(err.message);
  }
};

//dropbox/sharefile  -- POST
const shareFile = async (req, res) => {
  //{accessToken , path}
  var dbx = new Dropbox({ accessToken: req.body?.accessToken, fetch: fetch });
  dbx
    .sharingCreateSharedLink({
      path: req.body?.path,
    })
    .then((resp) => {
      console.log(resp);
      res.status(200).send(resp.result.url);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send(err?.message);
    });
};

module.exports = {
  getFileList,
  createApplication,
  downloadFile,
  shareFile,
  downloadIndividualFile,
  viewApplications,
};
