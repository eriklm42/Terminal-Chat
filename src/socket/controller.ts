// const users = []; // return database postgress
// const rooms = []; // return database mongodb

const users = new Map();
const rooms = new Map();

import { constants } from "./constants.js";

import socket from "./socket";

const socketServer = socket();


export default (props) => {
  const onNewConnection = (socket) => {
    const { id } = socket;
    const userData = { id, socket };
  };

  const joinRoom = async (socketId, data) => {
    const userData = data;
    console.log(`${userData.userName} joined! ${[socketId]}`);
    const user = updateGlobalUserData(socketId, userData);

    const { roomId } = userData;
    const users = joinUserOnRoom(roomId, user);

    const currentUsers = Array.from(users.values()).map(({ id, userName }) => ({ userName, id }));

    //  atualiza o usuario corrente sobre todos os usuarios
    // que jaa estao conectados na mesma sala
    socketServer.sendMessage(user.socket, constants.events.UPDATE_USERS, currentUsers);

    // avisa a rede que um novo usuario conectou-se
    broadCast({
      socketId,
      roomId,
      message: { id: socketId, userName: userData.userName },
      event: constants.events.NEW_USER_CONNECTED,
    });
  };

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
      event: constants.events.MESSAGE,
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
      socketId: id,
      event: constants.events.DISCONNECT_USER,
    });
  };

  const socketData = (id) => {
    return (data) => {
      try {
        const { event, message } = JSON.parse(data);
        event(id, message);
      } catch (error) {
        console.error(`wrong event format!!`, data.toString());
      }
    };
  };

  const updateGlobalUserData = (socketId, userData) => {
    const users = users.get();
    const user = users.get(socketId) ?? {};

    const updatedUserData = {
      ...user,
      ...userData,
    };

    users.set(socketId, updatedUserData);

    return users.get(socketId);
  };
};
