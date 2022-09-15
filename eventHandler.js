const axios = require("axios");
const { constants } = require("buffer");
const { fs } = require("fs");
const { workerData, parentPort } = require("worker_threads");

function handleEvent() {
  const event = workerData;
  console.log("Posting Event to Server", event.event);
  const postData = formatEvent(event);
  axios
    .post("http://pythonServer:5000/receiveEvent", { event: postData })
    .then((res) => {
      console.log("Received Res");
      // console.log(res);
      eventLogged(event);
      parentPort.postMessage("Succesful Request");
      process.exit();
    })
    .catch((error) => {
      console.log("Error Occured for When logging event: ", event.event);
      parentPort.postMessage("Failed Request");
      process.exit();
    });
}

function eventLogged(event) {
  // fs.writeFileSync("./events.json", JSON.stringify(event));
}

function formatEvent(event) {
  return JSON.stringify(event);
}

handleEvent();
// try {
//   handleEvent();
// } catch (err) {
//   console.log(err);
// }
