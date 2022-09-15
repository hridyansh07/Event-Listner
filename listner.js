const {
  Worker,
  isMainThread
} = require("worker_threads");
require("dotenv").config();


// Start Listening to Events 
function startListening() {
  // Only Allow Main Threads to create new workers
  if (isMainThread) {
    // Create thread and handle them
    const orderBookWorker = startListnerWorkerThread(
      process.env.ORDER_BOOK_ADDRESS,
      process.env.ORDER_BOOK_ABI
    );
    handleWorkerThreads(orderBookWorker);
    const marginWorker = startListnerWorkerThread(
      process.env.MARGIN_ADDRESS,
      process.env.MARGIN_ABI
    );
    handleWorkerThreads(marginWorker);
  }
}



// Function to create a thread that listens to events
function startListnerWorkerThread(
  contractAddress,
  contract_abi_path,
  infuraProvider = process.env.INFURA_PROVIDER,
  alchemyProvider = process.env.ALCHEMY_PROVIDER
) {
  console.log("Creating Worker Thread for address: ", contractAddress);
  return new Worker("./Worker.js", {
    env: {
      "contractAddress": contractAddress,
      "contract_abi_path": contract_abi_path,
      "infuraProvider": infuraProvider,
      "alchemyProvider": alchemyProvider,
    },
  });
}



// Emit logs for Specific data events
function handleWorkerThreads(workerInstance) {
  console.log("Worker Thread Handling");
  workerInstance.on("message", (data) => {
    console.log("Main Thread Logging for event ", data.event);
    startRequestThread(data);
  });
  workerInstance.on("error", (error) => {
    console.log(error);
  });
}

// Start request when a new thread is found
function startRequestThread(data)
{
    if(isMainThread)
    {
        console.log("Starting Thread for Request")
        workerInstance = new Worker("./eventHandler.js", {
            workerData: data
        })
        workerInstance.on("message", (data) => {
            console.log("Main Thread Logging for request: ", data);
        })
        workerInstance.on("exit", (data)=>{
            console.log("Worker Thread Exiting")
        })
    }

}


startListening();
