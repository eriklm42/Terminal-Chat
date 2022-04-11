import SocketServer from "./socket.js";
import Event from "events";
import Controller from "./controller.js";
import { constants } from "./constants.js";

const eventEmitter = new Event();

const port = process.env.PORT || 9898;
const socketServer = await SocketServer(port);

const server = await socketServer.initialize(eventEmitter);

console.log("socket server is running at", server.address().port);

const controller = new Controller({ socketServer });

eventEmitter.on(constants.events.NEW_USER_CONNECTED, controller.onNewConnection);
