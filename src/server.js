import Hapi, { server } from "@hapi/hapi";
import routes from "./routes/index.js";
import { db } from "./database.js";

const start = async () => {
  const server = Hapi.server({
    port: process.env.PORT || 3000,
    host: "localhost",
  });

  routes.forEach((route) => {
    server.route(route);
  });

  await server.start();
  console.log(`Server running on ${server.info.uri}`);
};

process.on("unhandledRejection", (err) => {
  console.log(err);
  process.exit(1);
});

process.on("SIGINT", async () => {
  console.log("Stopping server...");

  await server.stop({ timeout: 10000 });
  db.end();

  console.log("Server stopped");
  process.exit(0);
});

start();
