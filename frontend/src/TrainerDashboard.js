import React, { useState, useEffect } from "react";
import { Box, useTheme } from "@mui/material";
import CalendarWidget from "./components/CalendarWidget";
import TaskList from "./components/TaskList";
import axios from "axios";

const TrainerDashboard = () => {
  const theme = useTheme();
  const isRTL = theme.direction === "rtl";

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await axios.get("http://localhost:5000/tasks", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        });
        setTasks(response.data);
      } catch (error) {
        console.error("❌ שגיאה בטעינת משימות:", error);
      }
    };
    fetchTasks();
  }, []);

  return (
    <Box
      display="flex"
      flexDirection={isRTL ? "row-reverse" : "row"}
      justifyContent="center"
      alignItems="center"
      width="100%"
      height="100%"
      padding="10px"
      gap="20px"
    >
      {/* ✅ לוח שנה */}
      <Box sx={{ flex: 1, minWidth: "450px", height: "450px" }}>
        <CalendarWidget selectedDate={selectedDate} setSelectedDate={setSelectedDate} />
      </Box>

      {/* ✅ רשימת משימות */}
      <Box sx={{ flex: 1, minWidth: "450px", height: "450px" }}>
        <TaskList tasks={tasks} />
      </Box>
    </Box>
  );
};

export default TrainerDashboard;
