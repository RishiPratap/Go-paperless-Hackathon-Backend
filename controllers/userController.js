const { db } = require("../firebase");
const {
  getDocs,
  getDoc,
  collection,
  doc,
  updateDoc,
  deleteDoc,
  setDoc,
  query,
  where,
  increment
} = require("firebase/firestore");
var hellosign = require("hellosign-sdk")({
  key: "c9fec5e3c70d8fa2fb91a26c1426c707916de20fed40b2d845aab968b0edc93b",
});

// users/createnewuser
const user_register = async (req, res) => {
  // {name, rank, email, org, password}

  try {
    const userData = req.body;
    console.log(userData);
    const uid = userData.email.split("@")[0];

    // ADD HELLOSIGN CREATE ACCOUNT HERE
    let helloSignData = {
      email_address: userData.email,
    };
    console.log(helloSignData);
    // await hellosign.account
    //   .create(helloSignData)
    //   .then((response) => {
    //     helloSignData.account_id = response.account.account_id;
    //     console.log("response" ,response);
    //   }).catch((err) => {console.log(err); res.status(500).send(err.message);});

    //adding Users to firestore
    
    const usersRef = doc(db, `users/${uid}`);
    const basic_doc_details = {
      name: userData.name,
      email: userData.email,
      rank: userData.rank,
      org: userData.org,
      userName: uid,
      helloSignId: "vjvhm1651hjwvjsx",
      password : userData.password,
      dp_url : userData.dp_url,
    };
    console.log("Basic User Details", basic_doc_details);
    await setDoc(usersRef, basic_doc_details);
    res.status(200).send(uid);
  } catch (err) {
    console.log(err.code?.split("/")[1]);
    res.status(500).send(err.code?.split("/")[1]);
  }
};

// users/getuserdetails
const get_user = async(req, res) => {
  // {email, password}

  try{
    const docRef = doc(db, `users/${req.body.email.split("@")[0]}`);
    const userSnapshot = await getDoc(docRef);
    if(userSnapshot.exists()){
      if(userSnapshot.data().password == req.body.password){
          res.status(200).send(userSnapshot.data());
      }
      else{
        res.status(500).send("Incorrect Password");
      }
    } else {
      res.status(500).send("User Does Not Exist");
    }
  } catch(err){
    console.log(err.message);
  }
}

// users/addcontact
const create_new_contact = async (req, res) => {
  // {email, contact_email, contact_alias}

  try {
    console.log(req.body);
    const uid = req.body.email.split("@")[0];
    const docRef = doc(
      db,
      `users/${uid}/Contacts/${req.body.contact_alias}`
    );

    var contact_details = {
      alias: req.body.contact_alias,
      email: req.body.contact_email,
    };
    console.log("Contact Details", contact_details);
    await setDoc(docRef, contact_details);
    res.status(200).send("Contact Added Successfully");
  } catch (err) {
    res.status(500).send(err.message);
  }
};

// users/getmycontacts
const getContacts = async (req, res) => {
  // {email, }

  try {
    const colRef = collection(db, `users/${req.body.email.split("@")[0]}/Contacts`);
    const Snapshot = await getDocs(colRef);
    const contactList = Snapshot.docs.map((doc) => doc.data());
    console.log(contactList);
    let contacts_json = [];
    contactList.forEach((contact) => {
      contacts_json.push({value: contact.email, label: contact.alias});
    });
    res.status(200).send(contacts_json);
  } catch (err) {
    console.log(err.message);
    res.status(500).send("Server error");
  }
};

// users/getusersinorg
const get_contacts_in_same_org = async (req, res) => {
  // {username, org}

  try {
    const docRef = doc(db, `users/${req.body.username}`);
    const q = query(docRef, where("org", "==", req.body.org));
    const Snapshot = await getDocs(q);
    const contactList = Snapshot.docs.map((doc) => doc.data());
    console.log(contactList);
    res.status(200).send(contactList);
  } catch (err) {
    console.log(err.message);
    res.status(500).send("Server error");
  }
};

// users/deleteContact
const delete_contact = async (req, res) => {
  // {username, contact_username}

  try {
    const docRef = doc(
      db,
      `users/${req.body.username}/Contacts/${req.body.contact_username}`
    );
    await deleteDoc(docRef);
    res.status(200).send(contactList);
  } catch (err) {
    console.log(err.message);
    res.status(200).send("Server Error");
  }
};

// users/getmyapplications
const get_my_applications = async (req, res) => {
  // {username, status(all, pending, approved, rejected)}
  try {
    const colRef = collection(db, `users/${req.body.username}/Applications`);
    if (req.body.status === "all") {
      const Snapshot = await getDocs(colRef);
      const applicationList = Snapshot.docs.map((doc) => doc.data());
      console.log(applicationList);
      res.status(200).send(applicationList);
    } else {
      const q = query(colRef, where("status", "==", req.body.status));
      const Snapshot = await getDocs(q);
      const applicationList = Snapshot.docs.map((doc) => doc.data());
      console.log(applicationList);
      res.status(200).send(applicationList);
    }
  } catch (err) {
    res.status(500).send(err.message);
  }
};


// users/updatehop
const update_hop = async (req, res) => {
  try{
    console.log(req.body);
    const docRef = doc(db, 'users', req.body.email.split("@")[0], 'Applications', req.body.application_name);
    const docSnap = await getDoc(docRef);
    console.log(docSnap.data());
    const docData = docSnap.data();
      if(docData.current_hop < docData.total_signers - 1){
        updateDoc(docRef, {current_hop : increment(1)});
        const newDocRef = doc(db, "users", docData.signers[docData.current_hop + 1].split("@")[0], "Inbox", req.body.email.split("@")[0]);
        setDoc(newDocRef, {application_name : docData.alias, requester : req.body.email});
        console.log("Success");
        res.status(200).send("Success");
      } else{
        updateDoc(docRef, {current_hop : increment(1)});
        updateDoc(docRef, {status : "Accepted"})
        console.log("Success");
        res.status(200).send("Application Status Complete");
      }

      if(docData.current_hop != 0){
        const prevDocRef = doc(db, "users", docData.signers[docData.current_hop].split("@")[0], "Inbox", req.body.email.split("@")[0]);
        deleteDoc(prevDocRef);
      }
  } catch(err){
    res.status(500).send("Server Error");
    console.log(err);
  }
}


module.exports = {
  user_register,
  getContacts,
  create_new_contact,
  get_contacts_in_same_org,
  delete_contact,
  get_my_applications,
  get_user,
  update_hop,
};
