import Hapi, { server } from "@hapi/hapi";
import routes from "./routes/index.js";
import { db } from "./database.js";
import admin from 'firebase-admin'
import credentials from "../credentials.json" assert { type: "json" };
import AuthBearer from "hapi-auth-bearer-token"

admin.initializeApp({
  credential: admin.credential.cert(credentials),
});

const start = async () => {
  const server = Hapi.server({
    port: process.env.PORT || 3000,
    host: "localhost",
  });

  // await server.register(AuthBearer);

  // server.auth.strategy("simple", "bearer-access-token", {
  //   allowQueryToken: true,
  //   validate: async (request, token, h) => {
  //     try {
  //       const decodedToken = await admin.auth().verifyIdToken(token);
  //       const user = await db.query("SELECT * FROM users WHERE id = ?", [
  //         decodedToken.uid,
  //       ]);
  //       if (!user) {
  //         return { isValid: false };
  //       }
  //       request.user = user;
  //       return { isValid: true };
  //     } catch (error) {
  //       console.error("Error verifying token:", error);
  //       return { isValid: false };
  //     }
  //   },
  // });

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
