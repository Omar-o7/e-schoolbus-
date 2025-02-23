// school-dashboard.js
import { db } from './firebase-config.js';
import { ref, push, set, onValue, remove, update } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js";

// تسجيل طالب جديد
document.getElementById('registerStudentForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const studentName = document.getElementById('studentName').value.trim();
  const studentGrade = document.getElementById('studentGrade').value.trim(); // الصف الدراسي
  const studentPhone = document.getElementById('studentPhone').value.trim();

  if (!studentName || !studentGrade || !studentPhone) {
    alert('يرجى ملء جميع الحقول.');
    return;
  }

  try {
    const studentsRef = ref(db, 'students');
    await push(studentsRef, {
      name: studentName,
      grade: studentGrade, // الصف الدراسي
      phone: studentPhone,
    });

    alert('تم تسجيل الطالب بنجاح!');
    loadStudents(); // إعادة تحميل قائمة الطلاب
    document.getElementById('registerStudentForm').reset(); // مسح النموذج
  } catch (error) {
    console.error('حدث خطأ أثناء تسجيل الطالب:', error);
    alert('حدث خطأ أثناء تسجيل الطالب.');
  }
});

// تحميل قائمة الطلاب
function loadStudents() {
  const studentsRef = ref(db, 'students');
  onValue(studentsRef, (snapshot) => {
    const studentsList = document.getElementById('students');
    studentsList.innerHTML = '';

    const students = snapshot.val();
    if (students) {
      Object.keys(students).forEach((key) => {
        const student = students[key];
        const li = document.createElement('li');

        li.innerHTML = `
          ${student.name} (الصف: ${student.grade})
          <button class="edit-btn" data-key="${key}"><i class="fas fa-edit"></i> تعديل</button>
          <button class="delete-btn" data-key="${key}"><i class="fas fa-trash-alt"></i> حذف</button>
        `;

        studentsList.appendChild(li);
      });

      // إضافة مستمع للأزرار
      document.querySelectorAll('.edit-btn').forEach((button) => {
        button.addEventListener('click', editStudent);
      });
      document.querySelectorAll('.delete-btn').forEach((button) => {
        button.addEventListener('click', deleteStudent);
      });
    } else {
      studentsList.innerHTML = '<li>لا يوجد طلاب مسجلين.</li>';
    }
  });
}

// تعديل طالب
async function editStudent(event) {
  const key = event.target.closest('button').dataset.key;
  const newName = prompt('أدخل الاسم الجديد:');
  const newGrade = prompt('أدخل الصف الدراسي الجديد:');
  const newPhone = prompt('أدخل رقم الهاتف الجديد:');

  if (!newName || !newGrade || !newPhone) {
    alert('يرجى ملء جميع الحقول.');
    return;
  }

  try {
    const studentRef = ref(db, `students/${key}`);
    await update(studentRef, {
      name: newName,
      grade: newGrade, // الصف الدراسي
      phone: newPhone,
    });

    alert('تم تعديل الطالب بنجاح!');
    loadStudents(); // إعادة تحميل قائمة الطلاب
  } catch (error) {
    console.error('حدث خطأ أثناء تعديل الطالب:', error);
    alert('حدث خطأ أثناء تعديل الطالب.');
  }
}

// حذف طالب
async function deleteStudent(event) {
  const key = event.target.closest('button').dataset.key;

  if (confirm('هل أنت متأكد من حذف هذا الطالب؟')) {
    try {
      const studentRef = ref(db, `students/${key}`);
      await remove(studentRef);

      alert('تم حذف الطالب بنجاح!');
      loadStudents(); // إعادة تحميل قائمة الطلاب
    } catch (error) {
      console.error('حدث خطأ أثناء حذف الطالب:', error);
      alert('حدث خطأ أثناء حذف الطالب.');
    }
  }
}

// إدارة الحافلات
document.getElementById('manageBusesForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const busNumber = document.getElementById('busNumber').value.trim();
  const busCapacity = parseInt(document.getElementById('busCapacity').value.trim(), 10);

  if (!busNumber || isNaN(busCapacity)) {
    alert('يرجى ملء جميع الحقول.');
    return;
  }

  try {
    const busesRef = ref(db, 'buses');
    await push(busesRef, {
      number: busNumber,
      capacity: busCapacity,
    });

    alert('تمت إضافة الحافلة بنجاح!');
    loadBuses(); // إعادة تحميل قائمة الحافلات
    document.getElementById('manageBusesForm').reset(); // مسح النموذج
  } catch (error) {
    console.error('حدث خطأ أثناء إضافة الحافلة:', error);
    alert('حدث خطأ أثناء إضافة الحافلة.');
  }
});

// تحميل قائمة الحافلات
function loadBuses() {
  const busesRef = ref(db, 'buses');
  onValue(busesRef, (snapshot) => {
    const busesList = document.getElementById('buses');
    busesList.innerHTML = '';

    const buses = snapshot.val();
    if (buses) {
      Object.keys(buses).forEach((key) => {
        const bus = buses[key];
        const li = document.createElement('li');

        li.innerHTML = `
          حافلة رقم ${bus.number} (سعة: ${bus.capacity})
          <button class="edit-btn" data-key="${key}"><i class="fas fa-edit"></i> تعديل</button>
          <button class="delete-btn" data-key="${key}"><i class="fas fa-trash-alt"></i> حذف</button>
        `;

        busesList.appendChild(li);
      });

      // إضافة مستمع للأزرار
      document.querySelectorAll('.edit-btn').forEach((button) => {
        button.addEventListener('click', editBus);
      });
      document.querySelectorAll('.delete-btn').forEach((button) => {
        button.addEventListener('click', deleteBus);
      });
    } else {
      busesList.innerHTML = '<li>لا توجد حافلات مسجلة.</li>';
    }
  });
}

// تعديل حافلة
async function editBus(event) {
  const key = event.target.closest('button').dataset.key;
  const newNumber = prompt('أدخل رقم الحافلة الجديد:');
  const newCapacity = parseInt(prompt('أدخل السعة الجديدة:'), 10);

  if (!newNumber || isNaN(newCapacity)) {
    alert('يرجى ملء جميع الحقول.');
    return;
  }

  try {
    const busRef = ref(db, `buses/${key}`);
    await update(busRef, {
      number: newNumber,
      capacity: newCapacity,
    });

    alert('تم تعديل الحافلة بنجاح!');
    loadBuses(); // إعادة تحميل قائمة الحافلات
  } catch (error) {
    console.error('حدث خطأ أثناء تعديل الحافلة:', error);
    alert('حدث خطأ أثناء تعديل الحافلة.');
  }
}

// حذف حافلة
async function deleteBus(event) {
  const key = event.target.closest('button').dataset.key;

  if (confirm('هل أنت متأكد من حذف هذه الحافلة؟')) {
    try {
      const busRef = ref(db, `buses/${key}`);
      await remove(busRef);

      alert('تم حذف الحافلة بنجاح!');
      loadBuses(); // إعادة تحميل قائمة الحافلات
    } catch (error) {
      console.error('حدث خطأ أثناء حذف الحافلة:', error);
      alert('حدث خطأ أثناء حذف الحافلة.');
    }
  }
}

// إدارة السائقين
document.getElementById('manageDriversForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const driverName = document.getElementById('driverName').value.trim();
  const driverPhone = document.getElementById('driverPhone').value.trim();
  const driverLicense = document.getElementById('driverLicense').value.trim();

  if (!driverName || !driverPhone || !driverLicense) {
    alert('يرجى ملء جميع الحقول.');
    return;
  }

  try {
    const driversRef = ref(db, 'drivers');
    await push(driversRef, {
      name: driverName,
      phone: driverPhone,
      license: driverLicense,
    });

    alert('تمت إضافة السائق بنجاح!');
    loadDrivers(); // إعادة تحميل قائمة السائقين
    document.getElementById('manageDriversForm').reset(); // مسح النموذج
  } catch (error) {
    console.error('حدث خطأ أثناء إضافة السائق:', error);
    alert('حدث خطأ أثناء إضافة السائق.');
  }
});

// تحميل قائمة السائقين
function loadDrivers() {
  const driversRef = ref(db, 'drivers');
  onValue(driversRef, (snapshot) => {
    const driversList = document.getElementById('drivers');
    driversList.innerHTML = '';

    const drivers = snapshot.val();
    if (drivers) {
      Object.keys(drivers).forEach((key) => {
        const driver = drivers[key];
        const li = document.createElement('li');

        li.innerHTML = `
          ${driver.name} (${driver.phone})
          <button class="edit-btn" data-key="${key}"><i class="fas fa-edit"></i> تعديل</button>
          <button class="delete-btn" data-key="${key}"><i class="fas fa-trash-alt"></i> حذف</button>
        `;

        driversList.appendChild(li);
      });

      // إضافة مستمع للأزرار
      document.querySelectorAll('.edit-btn').forEach((button) => {
        button.addEventListener('click', editDriver);
      });
      document.querySelectorAll('.delete-btn').forEach((button) => {
        button.addEventListener('click', deleteDriver);
      });
    } else {
      driversList.innerHTML = '<li>لا توجد سائقين مسجلين.</li>';
    }
  });
}

// تعديل سائق
async function editDriver(event) {
  const key = event.target.closest('button').dataset.key;
  const newName = prompt('أدخل اسم السائق الجديد:');
  const newPhone = prompt('أدخل رقم الهاتف الجديد:');
  const newLicense = prompt('أدخل رقم الرخصة الجديد:');

  if (!newName || !newPhone || !newLicense) {
    alert('يرجى ملء جميع الحقول.');
    return;
  }

  try {
    const driverRef = ref(db, `drivers/${key}`);
    await update(driverRef, {
      name: newName,
      phone: newPhone,
      license: newLicense,
    });

    alert('تم تعديل السائق بنجاح!');
    loadDrivers(); // إعادة تحميل قائمة السائقين
  } catch (error) {
    console.error('حدث خطأ أثناء تعديل السائق:', error);
    alert('حدث خطأ أثناء تعديل السائق.');
  }
}

// حذف سائق
async function deleteDriver(event) {
  const key = event.target.closest('button').dataset.key;

  if (confirm('هل أنت متأكد من حذف هذا السائق؟')) {
    try {
      const driverRef = ref(db, `drivers/${key}`);
      await remove(driverRef);

      alert('تم حذف السائق بنجاح!');
      loadDrivers(); // إعادة تحميل قائمة السائقين
    } catch (error) {
      console.error('حدث خطأ أثناء حذف السائق:', error);
      alert('حدث خطأ أثناء حذف السائق.');
    }
  }
}

// استدعاء الدوال عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
  loadStudents(); // تحميل قائمة الطلاب
  loadBuses(); // تحميل قائمة الحافلات
  loadDrivers(); // تحميل قائمة السائقين
});