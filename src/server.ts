import app from "./app";
import config from "./config";
import { startCronJobs } from "./cron";
import { prisma } from "./lib/prisma";

async function main() {
  try {
    await prisma.$connect();
    console.log("Connected to the database successfully!");

    app.listen(config.port, () => {
      console.log(`Server is running on port: ${config.port}`);
    });

    startCronJobs();
  } catch (error) {
    console.error("Error Starting the server: ", error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

main();
