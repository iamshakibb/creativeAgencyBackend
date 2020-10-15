const MongoClient = require("mongodb").MongoClient;
const express = require("express");
const cors = require("cors");
const fileUpload = require("express-fileupload");
const ObjectId = require("mongodb").ObjectId;
require("dotenv").config();
const bodyParser = require("body-parser");
const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(fileUpload());
const port = 8000;
const uri = `mongodb+srv://${process.env.DB_User}:${process.env.DB_Pass}@noteit.yjcnh.mongodb.net/${process.env.DB_Name}?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect((err) => {
  const adminCollection = client.db(`${process.env.DB_Name}`).collection("Admin");
  const clientServicesCollection = client.db(`${process.env.DB_Name}`).collection("clientServices");
  const servicesCollection = client.db(`${process.env.DB_Name}`).collection("services");
  const clientFeedbackCollection = client.db(`${process.env.DB_Name}`).collection("clientFeedback");
  // sending service data to db
  app.post("/addServices", (req, res) => {
    const title = req.body.title;
    const description = req.body.description;
    const file = req.files.file;
    const readImg = file.data;
    const base64 = readImg.toString("base64");
    const image = {
      contentType: req.files.file.mimetype,
      size: req.files.file.size,
      img: Buffer.from(base64, "base64"),
    };
    servicesCollection.insertOne({ title: title, description: description, image: image }).then(() => {
      res.end();
    });
  });

  // getting all the services from db
  app.get("/getServices", (req, res) => {
    servicesCollection.find({}).toArray((error, documents) => {
      res.send(documents);
    });
  });

  // send client service order collection to db
  app.post("/addOrder", (req, res) => {
    const name = req.body.name;
    const email = req.body.email;
    const serviceName = req.body.serviceName;
    const projectDetail = req.body.projectDetail;
    const price = req.body.price;
    const img = req.body.img;
    const ispending = true;
    clientServicesCollection
      .insertOne({ name: name, ispending: ispending, price: price, serviceName: serviceName, projectDetail: projectDetail, email: email, img: img })
      .then(() => {
        res.end();
      });
  });

  // getting all the services order from db
  app.get("/getOrder", (req, res) => {
    clientServicesCollection.find({}).toArray((error, documents) => {
      res.send(documents);
    });
  });

  // getting single user services order from db
  app.get("/getSingleUserOrder", (req, res) => {
    clientServicesCollection.find({ email: req.query.email }).toArray((error, documents) => {
      res.send(documents);
    });
  });

  //Editing the service data from db
  app.patch("/editStatus/:id", (req, res) => {
    clientServicesCollection
      .updateOne(
        { _id: ObjectId(req.params.id) },
        {
          $set: { ispending: req.body.statusInfo },
        }
      )
      .then((result) => {
        res.end();
      });
  });

  // sending client feedback to db
  app.post("/sendClientFeedback", (req, res) => {
    const { img, name, designationAndCompanyName, feedback } = req.body;
    clientFeedbackCollection.insertOne({ img, name, designationAndCompanyName, feedback }).then(() => {
      res.end();
    });
  });

  // get client feedback to db
  app.get("/getClientFeedback", (req, res) => {
    clientFeedbackCollection.find({}).toArray((error, documents) => {
      res.send(documents);
    });
  });

  // Add admin data in db
  app.post("/addAdmin", (req, res) => {
    const { email } = req.body;
    adminCollection.insertOne({ email }).then(() => {
      res.end();
    });
  });

  // Add admin data in db
  app.get("/getAdminInfo", (req, res) => {
    adminCollection.find({ email: req.query.email }).toArray((error, documents) => {
      res.send(documents);
    });
  });
});

app.get("/", (req, res) => {
  res.send("SHIHABUN SHAKIB");
});

app.listen(process.env.PORT || port);
