import React, { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useSocket } from "../../socket/Socket";
import notifSound from "../../assets/mp3/notification_sound.mp3";
function Notification() {
  const [notificationCount, setNotificationCount] = useState(0);
  const [notification, setNotification] = useState([]);
  const { socket } = useSocket();

  const playSound = () => {
    const audio = new Audio(notifSound);
    audio.play();
  };

  useEffect(() => {
    if (socket) {
      socket.on("userConnected", (user) => {
        console.log("User connected:", user);
      });

      socket.on("report", (reportData) => {
        console.log("Report received:", reportData);
        const { emergency, location, message, senderId, percentage, img } = reportData;
        playSound();
        toast.success(emergency);
        setNotification(reportData);
        // Handle the report as needed in the UI
        console.log("Emergency:", emergency);
        console.log("Location:", location);
        console.log("Message:", message);
        console.log("Sender ID:", senderId);
        console.log("Percentage:", percentage);
        console.log("Message:", img);
      
      });

      // Cleanup listeners when the component unmounts
      return () => {
        socket.off("report");
        socket.off("userConnected");
      };
    }
  }, [socket]);

  // Handle the button click to refresh the page
  const handleRefresh = () => {
    setNotificationCount(0); // Reset the notification count
    window.location.reload(); // Reload the page
  };

  return (
    <>
    </>
  );
}

export default Notification;
