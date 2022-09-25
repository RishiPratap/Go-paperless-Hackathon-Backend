var fetch = require("isomorphic-fetch");
var Dropbox = require("dropbox").Dropbox;
const { db } = require("../firebase");
const { getDocs, getDoc, collection, doc, setDoc } = require("firebase/firestore");

// dropbox/viewapplication  -- POST
const viewApplications = async (req, res) => {
  // {email}
  try {
    const colRef = collection(
      db,
      `users/${req.body?.email.split("@")[0]}/Applications`
    );
    const docSnap = await getDocs(colRef);
    const docList = docSnap.docs.map((doc) => doc.data());
    console.log("DocList", docList);

    const applications = [];
    docList.forEach((doc) => {
      applications.push({ name: doc.alias, status: doc.status });
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
  const refPath = `users/${
    req.body.email.split("@")[0]
  }/Applications/${req.body.path}`;
  const docRef = doc(db, refPath);
  // console.log(docRef);
  const userSnapshot = await getDoc(docRef);
  const data_user = userSnapshot.data();

  let response = {
    current_hop: data_user.current_hop,
    total_hops: data_user.total_signers,
    signers : data_user.signers,
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
      data.forEach((file) => {response.files.push(file.name)});
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
  // {accessToken, appName, username, applType, signers(array)}
  var dbx = new Dropbox({ accessToken: req.body?.accessToken, fetch: fetch });
  dbx
    .fileRequestsCreate({
      title: req.body?.appName,
      destination: "/" + req.body?.appName,
    })
    .then(async (resp) => {
      console.log(resp);

      // ADD FIREBASE CODE HERE
      const docRef = doc(
        db,
        `users/${req.body?.username}/Applications/${req.body?.appName}`
      );
      const application_details = {
        url: resp.result?.url,
        total_signers: req.body?.signers.length,
        signers: req.body?.signers,
        status: "Pending",
        type: req.body?.applType,
        alias: req.body?.appName,
        current_hop: 0,
      };
      console.log(application_details);
      await setDoc(docRef, application_details);

      res.status(200).send(resp.result.url);
    })
    .catch((err) => {
      console.log(err?.message);
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
