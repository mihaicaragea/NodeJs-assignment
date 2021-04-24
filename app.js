const express = require("express");
const app = express();
var multer = require("multer");
var csv = require("fast-csv");
const upload = multer({ dest: "tmp/csv/" });
const fs = require("fs");
var HashMap = require("hashmap");

app.use(express.json());

app.post("/", upload.single("file"), (req, res) => {
  const jasonData = req.body;
  const csvData = req.file;

  const base64Code = req.headers.authorization;
  var queryString = Buffer.from(base64Code, "base64").toString("ascii");
  var decodedData = JSON.parse(queryString);

  const facilityNumbers = decodedData.facility;

  var listOfIDs = [];

  if (
    decodedData.roles.includes("Admin") ||
    decodedData.roles.includes("Practitioner")
  ) {
  } else {
    res.status(403).send("access forbidden");
    return;
  }
  if (csvData !== undefined) {
    const fileRows = new HashMap();
    let correctData = true;
    csv
      .parseFile(req.file.path, { trim: true })
      .on("data", function (data) {
        let dataFullName = data[1] + " " + data[2];
        let existing = fileRows.get(data[0]);
        if (existing === undefined) {
          let facility = {
            FullName: dataFullName,
            FacilityName: [],
          };
          if (data[6] === "true" && facilityNumbers.includes(data[3])) {
            facility.FacilityName.push(data[5]);
            fileRows.set(data[0], facility);
          }
        } else if (existing.FullName == dataFullName) {
          if (data[6] === "true") {
            existing.FacilityName.push(data[5]);
          }
        } else {
          correctData = false;
          fs.unlinkSync(req.file.path);
          res.status(400).send("Invalid data");
        }
      })
      .on("end", function () {
        if (correctData) {
          fileRows.forEach((doc, id) => {
            console.log(doc.FullName + ": " + doc.FacilityName);
          });
          fs.unlinkSync(req.file.path);
          res.status(200).send("Information printed in console");
        }
      });
  } else if (req.is("application/json")) {
    if (!jasonData.id || jasonData.resourceType != "Practitioner") {
      return res.status(400).send("Invalid id or check resourceType");
    } else if (listOfIDs.includes(jasonData.id)) {
      return res.status(400).send("Id already submitted");
    } else if (jasonData.active === true) {
      listOfIDs.push(jasonData.id);
      console.log(jasonData.name[0].text);
      jasonData.facility.map((facility)=>{console.log(facility.name)})
      res.status(200).send("Information printed in console");
    } else {
      res.status(400).send("No data to process");
      console.log("No data to process");
    }
  }
});
app.listen(9999, () => {
  console.log("Listening on port 9999...");
});
