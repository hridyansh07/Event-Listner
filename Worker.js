const Web3 = require("web3");
const {parentPort} = require("worker_threads");

// Start the event listner for any thread on a given contract address and abi
function listenToEvents() {
  console.log("Worker on ", process.env.contractAddress);
  console.log("ABI Path", process.env.contract_abi_path);
  const web3 = setUpConnection();
  const contract = new web3.eth.Contract(
    require(process.env.contract_abi_path),
    process.env.contractAddress
  );
  contract.events.allEvents((error, event) => {
    console.log("Worker Thread Logging");
    eventData = formatEventData(event);
    console.log(eventData);
    // Push the event found to parent thread to start a request thread 
    parentPort.postMessage(event);
  });
}


function formatEventData(event) {
  console.log("Formatting Event");
  blockNumber = event["blockNumber"];
  transactionHash = event["transactionHash"];
  returnValues = event["returnValues"];
  eventName = event["event"];
  console.log(blockNumber, transactionHash, returnValues, eventName);
  return {
    BlockNumber: blockNumber,
    TransactionHash: transactionHash,
    ReturnValues: returnValues["Result"],
    Event: eventName,
  };
}

function setUpConnection(provider = "infura") {
  if (provider == "infura")
    return new Web3(
      new Web3.providers.WebsocketProvider(process.env.infuraProvider)
    );
  else {
    return new Web3(
      new Web3.providers.WebsocketProvider(process.env.alchemyProvider)
    );
  }
}


listenToEvents();