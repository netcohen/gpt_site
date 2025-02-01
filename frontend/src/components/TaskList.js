import React, { useState } from "react";
import { Paper, TextField, Button, Typography } from "@mui/material";

const TaskList = ({ tasks, addTask }) => {
  const [newTask, setNewTask] = useState("");

  return (
    <Paper sx={{
      width: "100%",
      height: "400px",  // ✅ אותו גובה כמו הלוח שנה
      display: "flex",
      flexDirection: "column",
      justifyContent: "flex-start",
      borderRadius: "12px",
      boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
      padding: "10px",
      background: "#f9f9f9",
      overflowY: "auto"  // ✅ גלילה פנימית במידה והמשימות חורגות מהגובה
    }}>
      <Typography variant="h6">✅ משימות</Typography>
      
      <div style={{ display: "flex", alignItems: "center", marginBottom: "10px" }}>
        <TextField
          label="הוסף משימה חדשה"
          variant="outlined"
          size="small"
          fullWidth
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
        />
        <Button onClick={() => { addTask(newTask); setNewTask(""); }} sx={{ ml: 1 }} variant="contained">
          ➕
        </Button>
      </div>

      {tasks.length === 0 ? (
        <Typography>אין משימות כרגע.</Typography>
      ) : (
        <ul>
          {tasks.map((task, index) => (
            <li key={index}>{task.description} {task.completed ? "✅" : "❌"}</li>
          ))}
        </ul>
      )}
    </Paper>
  );
};

export default TaskList;
