require("dotenv-defaults").config();
import { GraphQLServer, PubSub } from "graphql-yoga";
import Query from "./server/resolvers/Query.js";
import Mutation from "./server/resolvers/Mutation.js";
import Subscription from "./server/resolvers/Subscription.js";

const mongoose = require("mongoose");
const express = require("express");
const path = require("path");
const port1 = process.env.PORT || 80;
const port2 = process.env.PORT || 80;
const app = express();
app.use(express.static(path.join(__dirname, "build")));

const bodyParser = require("body-parser");
const apiRoute = require("./src/route/api");
app.use("/api", apiRoute);
app.use(bodyParser.json());

app.get("/ping", function (req, res) {
  return res.send("pong");
});

app.get("/*", function (req, res) {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

app.listen(port1);
console.log(`The server is up on port ${port1}!`);
console.log("Server Ready!");

const Restaurant = require("./server/models/restaurant.js");

const pubsub = new PubSub();

if (!process.env.MONGO_URL) {
  console.error("Missing MONGO_URL!!!");
  process.exit(1);
}

mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

const server = new GraphQLServer({
  typeDefs: "./server/schema.graphql",
  resolvers: {
    Query,
    Mutation,
    Subscription,
  },
  context: {
    Restaurant,
    pubsub,
  },
});

db.on("error", (error) => {
  console.error(error);
});

db.once("open", () => {
  console.log("MongoDB connected!");
});

server.start({ port: port2 }, () => {
  console.log(`The server is up on port ${port2}!`);
});
