import { useEffect, useState } from "react";

const useWebSocket = (url) => {
  const [socketData, setSocketData] = useState(null);

  const WS_SERVER = `ws://localhost:9999/`;

  useEffect(() => {
    const ws = new WebSocket(WS_SERVER);

    ws.onopen = () => {
      console.log("WebSocket connection established");
    };

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      setSocketData(message);
    };

    ws.onerror = (error) => {
      console.error("WebSocket error", error);
    };

    ws.onclose = () => {
      console.log("WebSocket connection closed");
    };

    return () => {
      ws.close();
    };
  }, [url]);

  return socketData;
};

export default useWebSocket;
