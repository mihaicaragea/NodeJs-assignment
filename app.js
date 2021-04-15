const express = require('express');
const app = express();

app.use(express.json());

 app.get('/',(req,res)=>{
    const doc = req.body
    if(!doc.id || doc.resourceType!= "Practitioner" ){
        res.status(400).send('Invalid id or check resourceType')
    }else if(doc.active===true){
        console.log(doc.name)
        console.log(doc.facility)
        res.status(200).send('Information printed in console')
    }
 });

 app.listen(9998, ()=>{
     console.log("Listening on port 9999...")
 });