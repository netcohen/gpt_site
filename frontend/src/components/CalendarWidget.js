import React, { useState } from "react";
import { Paper, Box, Button } from "@mui/material";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "../styles/CalendarStyles.css";

const CalendarWidget = ({ selectedDate, setSelectedDate }) => {
  const goToToday = () => {
    setSelectedDate(new Date());
  };

  return (
    <Paper className="calendar-container">
      {/* שורת הניווט הכוללת את הכפתור */}
      <Box className="calendar-navigation">
        <Button variant="contained" color="secondary" size="small" onClick={goToToday}>
          חזרה להיום
        </Button>
      </Box>

      {/* רכיב לוח השנה */}
      <Box className="calendar-box">
        <Calendar
          onChange={setSelectedDate}
          value={selectedDate}
          locale="he-IL"
          className="custom-calendar"
        />
      </Box>
    </Paper>
  );
};

export default CalendarWidget;
