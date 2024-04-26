const Hapi = require("@hapi/hapi");
const routes = require("./routes");
const { initDB } = require("./services/dbService");
const dotenv = require("dotenv");

const init = async () => {
  dotenv.config();
  const server = Hapi.server({
    port: 8000,
    host: "localhost",
    routes: {
      cors: true,
    },
  });

  this.__proto__.$db = await initDB();
  await server.start();
  server.route(routes);
  console.log("Server running on %s", server.info.uri);
};

process.on("unhandledRejection", (err) => {
  console.log(err);
  process.exit(1);
});

init();
