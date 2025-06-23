import mongoose from "mongoose";
import app from "./app";
import { Server } from "http";
import adminSeeder from "./seeder/adminSeeder";
import config from "./config";
import habitReminder from "./util/habitReminder";



let server: Server;

async function main() {
  try {
    console.log("connecting to mongodb....⏳");
    await mongoose.connect(config.mongoose_uri);
    console.log("mongo db connected successfully")
    await adminSeeder()
    console.log("admin seeding done ===>><<+++")
    server = app.listen(config.port, () => {
      console.log(` LUNA3 app listening on port ${config.port}`);
    });

    await habitReminder()
    
  } 
  catch (err:any) {
    throw Error('something went wrong in server or mongoose connection');
  }
}
main();

// Global unhandled promise rejection handler
process.on('unhandledRejection', async (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Gracefully shutting down the server
  if (server) {
    try {
      server.close(() => {
        console.log(
          'Server and MongoDB connection closed due to unhandled rejection.',
        );
        process.exit(1); // Exit the process with an error code
      });
    } catch (err) {
      console.error('Error during shutdown:', err);
      process.exit(1); // Exit with error code if shutting down fails
    }
  } else {
    process.exit(1);
  }
});

// Global uncaught exception handler
process.on('uncaughtException', async (err) => {
  console.error('Uncaught Exception:', err);
  // Gracefully shutting down the server
  if (server) {
    try {
      server.close(() => {
        console.log(
          'Server and MongoDB connection closed due to uncaught exception.',
        );
        process.exit(1); // Exit the process with an error code
      });
    } catch (err) {
      console.error('Error during shutdown:', err);
      process.exit(1); // Exit with error code if shutting down fails
    }
  } else {
    process.exit(1);
  }
});
