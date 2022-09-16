var fetch = require("isomorphic-fetch");
var Dropbox = require("dropbox").Dropbox;

//dropbox/getfiles  -- POST
const getFileList = async (req, res) => {
  //{acessToken, path}

  var dbx = new Dropbox({ accessToken: req.body?.accessToken, fetch: fetch });
  dbx
    .filesListFolder({
      path: req.body?.path,
    })
    .then((resp) => {
      console.log(resp?.result?.entries);
      res.status(200).send(resp?.result?.entries);
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
  // {accessToken, appName}
  var dbx = new Dropbox({ accessToken: req.body?.accessToken, fetch: fetch });
  dbx
    .fileRequestsCreate({
      title: req.body?.appName,
      destination: "/" + req.body?.appName,
    })
    .then((resp) => {
      console.log(resp);

      // ADD FIREBASE CODE HERE

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
};
