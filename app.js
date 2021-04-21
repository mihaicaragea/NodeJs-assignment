const express = require("express");
const app = express();
var multer = require("multer");
var csv = require("fast-csv");
var HashMap = require("hashmap");
const upload = multer({ dest: "tmp/csv/" });

app.use(express.json());

app.get("/", upload.single("file"), (req, res) => {
  const doc = req.body;

  if (!doc.id || doc.resourceType != "Practitioner") {
    res.status(400).send("Invalid id or check resourceType");
  } else if (doc.active === true) {
    console.log(doc.name);
    console.log(doc.facility);
    res.status(200).send("Information printed in console");
  }
});

app.post("/", upload.single("file"), function (req, res) {
  const fileRows = new HashMap();
  var correctData = true;
  csv
    .parseFile(req.file.path, { trim: true })
    .on("data", function (data) {
      let dataFullName = data[1] + " " + data[2];
      let existing = fileRows.get(data[0]);
      if (existing === undefined) {
        let facility = {
          FullName: dataFullName,
          FacilityId: [],
        };
        if (data[6] === "true") {
          facility.FacilityId.push(data[5]);
        }
        fileRows.set(data[0], facility);
      } else if (existing.FullName == dataFullName) {
        if (data[6] === "true") {
          existing.FacilityId.push(data[5]);
        }
      } else {
        correctData = false;
        res.status(400).send("Invalid data");
      }
    })
    .on("end", function () {
      if (correctData) {
        fileRows.forEach((doc, id) => {
          console.log(doc.FullName + ": " + doc.FacilityId);
        });
        res.status(200).send("Information printed in console");
      }
    });
});
app.listen(9999, () => {
  console.log("Listening on port 9999...");
});
