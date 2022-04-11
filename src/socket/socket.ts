import http from "http";
import { v4 } from "uuid";

export default (options = {}) => {
  const sendMessage = (socket: any, event: any, message: string): void => {
    const data = JSON.stringify({ event, message });
    socket.write(`${data}`);
  };

  const createServer = async () => {
    http.createServer((req, res) => {
      res.writeHead(200, { "Content-Type": "text/plain" });
      res.end("res.end empty");
    });
  };

  const initialize = async (): Promise<Any> => {
    const server = await createServer();

    server.on("upgrade", (req, socket) => {
      socket.id = v4();
      const headers = ["HTTP/1.1 101 Web Socket Protocol Handshake", "Upgrade: WebSocket", "Connection: Upgrade", ""]
        .map((line) => line.concat("\r\n"))
        .join("");

      console.log({ headers });

      socket.write(headers);
      // change newUserConnected for env event new client connected
      eventEmitter.emit("newUserConnected");

      return new Promise((resolve, reject) => {
        server.on("error", reject);
        // 9898 in port in env
        server.listen(9898, () => resolve(server));
      });
    });
  };
};
