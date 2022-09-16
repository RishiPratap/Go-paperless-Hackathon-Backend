const { auth, db } = require("../firebase");
const {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} = require("firebase/auth");
const {
  getDocs,
  getDoc,
  collection,
  addDoc,
  serverTimestamp,
  doc,
  updateDoc,
  deleteDoc,
  setDoc,
  query,
  where,
  increment,
  GeoPoint,
} = require("firebase/firestore");


// users/createnewuser
const user_register = async (req, res) => {

  // {name, rank, email, org}

  try {
    const userData = req.body;
    console.log(userData);
    const uid = userData.userName;

    //adding Users to firestore

    const usersRef = doc(db, `users/${uid}`);
    const basic_doc_details = {
      name: userData.name,
      email: userData.email,
      rank: userData.rank,
      org : userData.org,
      userName : userData.userName,
    };
    console.log("Basic User Details",basic_doc_details);
    await setDoc(usersRef, basic_doc_details);
    res.status(200).send(uid);
  } catch (err) {
    console.log(err.code?.split("/")[1]);
    res.status(500).send(err.code?.split("/")[1]);
  }
};

// users/addcontact
const create_new_contact = async (req, res) => {

  // {email, contact_email, contact_alias}

  try {
    console.log(req.body);
    const uid = req.body.userName;
    const docRef = doc(db, `users/${uid}/Contacts/${req.body.contact_username}`);

    var contact_details = {
      alias : req.body.contact_alias,
      username : req.body.userName,
      email : req.body.email
    };
    console.log("Contact Details",contact_details);
    await setDoc(docRef, contact_details);
    res.status(200).send("Contact Added Successfully");
  } catch (err) {
    res.status(500).send(err.message);
  }
};

// users/getmycontacts
const getContacts = async (req, res) => {
  // {username, }

  try{
    const colRef = collection(db, `users/${req.body.username}/Contacts`);
    const Snapshot = await getDocs(colRef);
    const contactList = Snapshot.docs.map((doc) => doc.data());
    console.log(contactList);
    res.status(200).send(contactList);
  } catch(err){
    console.log(err.message);
    res.status(500).send("Server error");
  }
};

// users/getusersinorg
const get_contacts_in_same_org = (req, res) => {
  // {username, org}

  try{
    const docRef = doc(db, `users/${req.body.username}`);
    const q = query(docRef, where("org", "==", req.body.org));
    const Snapshot = await getDocs(q);
    const contactList = Snapshot.docs.map((doc) => doc.data());
    console.log(contactList);
    res.status(200).send(contactList);
  } catch(err) {
    console.log(err.message);
    res.status(500).send("Server error");
  }
};

// users/deleteContact
const delete_contact = (req, res) => {
  // {username, contact_username}

  try{
    const docRef = doc(db, `users/${req.body.username}/Contacts/${req.body.contact_username}`);
    await deleteDoc(docRef);
    res.status(200).send(contactList);
  } catch(err) {
    console.log(err.message);
    res.status(200).send("Server Error");
  }
};

module.exports = {
  user_register,
  getContacts,
  getUserDetails,
  updateUser,
  create_new_contact,
  addFloor,
  get_contacts_in_same_org,
  delete_contact,
};




// users/gethospital
const getUserDetails = async (req, res) => {
  try {
    console.log(req.body);
    const docRef = doc(db, "hospitals", req.body.docId);
    const userSnapshot = await getDoc(docRef);

    if (userSnapshot.exists()) {
      console.log("Document Data: ", userSnapshot.data());
      res.status(200).send(userSnapshot.data());
    } else {
      console.log("User Does Not exist");
    }
  } catch (err) {
    res.status(500).send(err.message);
  }
};

// /api/users/updateroomstatus
const updateUser = async (req, res) => {
  try {
    console.log(req.body);
    const hospId = req.body.hospId;
    const floorNumber = "F" + req.body.floor.toString();
    const roomNumber =
      req.body.floor.toString() + get_room_number(req.body.roomNumber);
    const documentRef = doc(db, `hospitals/${hospId}/Rooms/${floorNumber}`);
    const value = {};
    value[roomNumber] = req.body.bool;
    await updateDoc(documentRef, value);
    res.status(200).send("Updated Successfully");
  } catch (err) {
    console.log(err);
    res.status(500).send("Server error");
  }
};

// /api/addfloor
const addFloor = async (req, res) => {
  try {
    const hospitalData = req.body;
    console.log(hospitalData);
    const uid = hospitalData.hospId;
    const floor_details = hospitalData.floors;
    const total_floors = req.body["existing"] + Object.keys(req.body.floors).length;
    console.log("floor details ",floor_details);
    console.log("total_floors ",total_floors);
    console.log("uid",uid);

    const start = req.body["existing"] + 1;

    for (let i = start; i <= total_floors; i++) {
        // console.log(i);
      const id = "F" + i.toString();
      
      const total_rooms = floor_details[id];
      const room_details = {};
      for (let j = 1; j <= total_rooms; j++) {
        room_details[i.toString() + get_room_number(j)] = false;
      }
      console.log(id, room_details);
      const floor = doc(db, `hospitals/${uid}/Rooms/${id}`);
      await setDoc(floor, room_details);
    }
    res.status(200).send("Updated Successfully");
  } catch (err) {
    console.log(err.code?.split("/")[1]);
    res.status(500).send(err.code?.split("/")[1]);
  }
};

//HELPER FUNCTIONS
function get_room_number(room) {
  if (room < 10) {
    room = "0" + room.toString();
  } else {
    room = room.toString();
  }
  return room;
}
