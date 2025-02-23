// manage-schools.js
import { db } from './firebase-config.js';
import { ref, set, onValue, remove } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js";

let currentSchoolName = null; // لتخزين اسم المدرسة المحددة للتعديل

// إضافة مدرسة جديدة
document.getElementById('addSchoolForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const schoolName = document.getElementById('newSchoolName').value.trim();
  const schoolPassword = document.getElementById('newSchoolPassword').value.trim();
  const schoolPhone = document.getElementById('newSchoolPhone').value.trim();
  const schoolEmail = document.getElementById('newSchoolEmail').value.trim();

  if (!schoolName || !schoolPassword || !schoolPhone || !schoolEmail) {
    alert('يرجى ملء جميع الحقول.');
    return;
  }

  try {
    // إضافة المدرسة إلى قاعدة البيانات
    const schoolRef = ref(db, `schools/${schoolName}`);
    await set(schoolRef, {
      name: schoolName,
      password: schoolPassword,
      phone: schoolPhone,
      email: schoolEmail,
    });

    alert('تمت إضافة المدرسة بنجاح!');
    loadSchools(); // إعادة تحميل قائمة المدارس
  } catch (error) {
    console.error('حدث خطأ أثناء إضافة المدرسة:', error);
    alert('حدث خطأ أثناء إضافة المدرسة: ' + error.message);
  }
});

// تحميل قائمة المدارس
function loadSchools() {
  const schoolsRef = ref(db, 'schools');
  onValue(schoolsRef, (snapshot) => {
    const schools = snapshot.val();
    const schoolList = document.getElementById('schools');
    schoolList.innerHTML = ''; // مسح القائمة الحالية

    if (schools) {
      Object.keys(schools).forEach((schoolName) => {
        const li = document.createElement('li');
        li.textContent = `${schoolName} - ${schools[schoolName].phone}`;

        // زر تعديل المدرسة
        const editButton = document.createElement('button');
        editButton.textContent = 'تعديل';
        editButton.onclick = () => openEditForm(schoolName, schools[schoolName]);
        li.appendChild(editButton);

        // زر حذف المدرسة
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'حذف';
        deleteButton.onclick = () => deleteSchool(schoolName);
        li.appendChild(deleteButton);

        schoolList.appendChild(li);
      });
    } else {
      schoolList.innerHTML = '<li>لا توجد مدارس مضافة.</li>';
    }
  });
}

// حذف مدرسة
async function deleteSchool(schoolName) {
  if (confirm(`هل تريد حذف المدرسة "${schoolName}"؟`)) {
    try {
      const schoolRef = ref(db, `schools/${schoolName}`);
      await remove(schoolRef);
      alert('تم حذف المدرسة بنجاح!');
      loadSchools(); // إعادة تحميل قائمة المدارس
    } catch (error) {
      alert('حدث خطأ أثناء حذف المدرسة: ' + error.message);
    }
  }
}

// فتح نموذج تعديل المدرسة
function openEditForm(schoolName, schoolData) {
  currentSchoolName = schoolName;

  document.getElementById('editSchoolName').value = schoolData.name;
  document.getElementById('editSchoolPassword').value = schoolData.password;
  document.getElementById('editSchoolPhone').value = schoolData.phone;
  document.getElementById('editSchoolEmail').value = schoolData.email;

  document.getElementById('editSchoolFormContainer').style.display = 'block';
}

// حفظ التعديلات على بيانات المدرسة
document.getElementById('editSchoolForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const newSchoolPassword = document.getElementById('editSchoolPassword').value.trim();
  const newSchoolPhone = document.getElementById('editSchoolPhone').value.trim();
  const newSchoolEmail = document.getElementById('editSchoolEmail').value.trim();

  try {
    const schoolRef = ref(db, `schools/${currentSchoolName}`);
    await set(schoolRef, {
      name: currentSchoolName,
      password: newSchoolPassword,
      phone: newSchoolPhone,
      email: newSchoolEmail,
    });

    alert('تم تعديل بيانات المدرسة بنجاح!');
    closeEditForm();
    loadSchools(); // إعادة تحميل قائمة المدارس
  } catch (error) {
    alert('حدث خطأ أثناء تعديل بيانات المدرسة: ' + error.message);
  }
});

// إغلاق نموذج تعديل المدرسة
document.getElementById('cancelEdit').addEventListener('click', () => {
  closeEditForm();
});

// إغلاق نموذج التعديل
function closeEditForm() {
  document.getElementById('editSchoolFormContainer').style.display = 'none';
  document.getElementById('editSchoolForm').reset();
  currentSchoolName = null;
}

// تحميل قائمة المدارس عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', loadSchools);