import React from 'react';
import { Box, Typography } from '@mui/material';

function AdminDashboard() {
  return (
    <Box mt={3} p={3}>
      <Typography variant="h6">🔒 ניהול מערכת</Typography>
      <Typography>כאן יוצגו סטטיסטיקות ופעולות מנהל.</Typography>
      {/* ניתן להוסיף בהמשך כלים לניהול משתמשים ונתונים נוספים */}
    </Box>
  );
}

export default AdminDashboard;
