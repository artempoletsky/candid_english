"use client";
import { useEffect } from "react";
// import io from "socket.io-client";

// const socket = io("http://localhost:3001", { transports: ['websocket'] });
const socket = new WebSocket("ws://localhost:3001");
export default function Chat() {
  useEffect(() => {
    // socket.ad
    
    socket.addEventListener("message", console.log);
  }, []);
  return "";
}