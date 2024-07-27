"use strict";

const Hapi = require("@hapi/hapi");
const routes = require("./routes");
const { initDB } = require("./services/dbService");
const dotenv = require("dotenv");

const server = Hapi.server({
  port: 10000,
  host: "0.0.0.0",
  routes: {
    cors: true,
  },
});

const init = async () => {
  dotenv.config();
  this.$db = await initDB();
  await server.register([
    {
      plugin: require("@hapi/inert"),
      options: {}
    },
    {
      plugin: require("hapi-pino"),
      options: {
        logEvents: ["response", "onPostStart"]
      }
    }]);

  server.route({
    method: "GET",
    path: "/",
    handler: (request, h) => {

      return h.file("./public/hello.html");
    }
  });
  server.route(routes);

  await server.start();
  console.log(`Server running at: ${server.info.uri}`);
};

process.on("unhandledRejection", (err) => {

  console.log(err);
  process.exit(1);
});

init();