const users = []; // return database postgress
const rooms = []; // return database mongodb

import socketServer from "./socket";

const controller = () => {};

const onNewConnection = (socket) => {
  const { id } = socket;
  const userData = { id, socket };
};

const joinRoom = async (socketId, data) => {};

const broadCast = ({ socketId, roomId, event, message, includeCurrentSocket = false }) => {
  const usersOnRoom = rooms.get(roomId);

  for (const [key, user] of usersOnRoom) {
    if (!includeCurrentSocket && key === socketId) continue;

    socketServer.sendMessage(user.socket, event, message);
  }
};

const message = (socketId, data) => {
  const { userName, roomId } = users.get(socketId);

  broadCast({
    roomId,
    socketId,
    event: "add env",
    message: { userName, message: data },
    includeCurrentSocket: true,
  });
};

const joinUserOnRoom = (roomId, user) => {
  const usersOnRoom = rooms.get(roomId) ?? new Map();
  usersOnRoom.set(user.id, user);

  return usersOnRoom;
};

const logoutUser = (id, roomId) => {
  users.delete(id);
  const usersOnRoom = rooms.get(roomId);
  rooms.set(roomId, usersOnRoom);
};

const socketClosed = (id) => {
  const { userName, roomId } = users.get(id);
  logoutUser(id, roomId);

  broadCast({
    roomId,
    message: { id, userName },
    socketId: id
    event: 
  });
};

const socketData = (id) => {
    return data => {
        try {
            const { event, message } = JSON.parse(data)
            event(id, message)
        } catch (error) {
            console.error(`wrong event format!!`, data.toString())
        }
    }
};

const updateGlobalUserData = (socketId, userData) => {
    const users = users.get()
    const user = users.get(socketId) ?? {}

    const updatedUserData = {
        ...user,
        ...userData
    }

    users.set(socketId, updatedUserData)

    return users.get(socketId)
};
