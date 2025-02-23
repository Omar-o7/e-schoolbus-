// attendance-report.js
import { db } from './firebase-config.js';
import { ref, onValue } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js";

// استرداد تقارير الحضور من Firebase
const reportsRef = ref(db, 'students');
onValue(reportsRef, (snapshot) => {
  const students = snapshot.val();
  const reportList = document.getElementById('reports');

  Object.values(students).forEach((student) => {
    const li = document.createElement('li');
    li.textContent = `${student.name} (${student.nationalId}) - الحضور: ${student.attendance || 'غير مسجل'}`;
    reportList.appendChild(li);
  });
});