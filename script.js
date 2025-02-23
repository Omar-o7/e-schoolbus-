// script.js
import { db, auth, provider } from './firebase-config.js';
import { ref, get } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js";
import { signInWithPopup } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";

// تسجيل دخول السائق
document.getElementById('driverLogin').addEventListener('submit', async (e) => {
  e.preventDefault();

  const driverNationalId = document.getElementById('driverNationalIdLogin').value;

  try {
    // التحقق من وجود السائق في قاعدة البيانات
    const driverRef = ref(db, `drivers/${driverNationalId}`);
    const snapshot = await get(driverRef);

    if (snapshot.exists()) {
      alert('تم تسجيل الدخول بنجاح!');
      window.location.href = `driver-dashboard.html?nationalId=${driverNationalId}`;
    } else {
      alert('الرقم الوطني غير صحيح. يرجى المحاولة مرة أخرى.');
    }
  } catch (error) {
    alert('حدث خطأ أثناء تسجيل الدخول: ' + error.message);
  }
});

// تسجيل دخول ولي الأمر
document.getElementById('parentLogin').addEventListener('submit', (e) => {
  e.preventDefault();

  const parentName = document.getElementById('parentNameLogin').value;
  const parentPhone = document.getElementById('parentPhoneLogin').value;

  // توجيه ولي الأمر مباشرةً إلى لوحة التحكم
  alert(`مرحبًا ${parentName}! تم تسجيل الدخول بنجاح.`);
  window.location.href = `parent-dashboard.html?name=${encodeURIComponent(parentName)}&phone=${encodeURIComponent(parentPhone)}`;
});

// تسجيل دخول المدرسة
document.getElementById('schoolLogin').addEventListener('submit', async (e) => {
  e.preventDefault();

  const schoolName = document.getElementById('schoolNameLogin').value.trim();
  const schoolPassword = document.getElementById('schoolPasswordLogin').value.trim();

  try {
    // التحقق من وجود المدرسة في قاعدة البيانات
    const schoolRef = ref(db, `schools/${schoolName}`);
    const snapshot = await get(schoolRef);

    if (snapshot.exists()) {
      const schoolData = snapshot.val();

      // التحقق من صحة كلمة المرور
      if (schoolData.password === schoolPassword) {
        alert('تم تسجيل الدخول بنجاح!');
        window.location.href = `school-dashboard.html`;
      } else {
        alert('كلمة المرور غير صحيحة. يرجى المحاولة مرة أخرى.');
      }
    } else {
      alert('اسم المدرسة غير صحيح. يرجى المحاولة مرة أخرى.');
    }
  } catch (error) {
    alert('حدث خطأ أثناء تسجيل الدخول: ' + error.message);
  }
});

// تسجيل الدخول باستخدام Google
document.getElementById('googleLogin').addEventListener('click', async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    // عرض معلومات المستخدم
    console.log('User logged in:', user);

    // يمكنك هنا تخزين بيانات المستخدم في قاعدة البيانات إذا كنت بحاجة لذلك
    alert(`مرحبًا ${user.displayName}! تم تسجيل الدخول بنجاح.`);

    // إعادة توجيه المستخدم إلى صفحة لوحة التحكم المناسبة
    window.location.href = 'dashboard.html'; // يمكنك تعديل هذا المسار حسب الحاجة
  } catch (error) {
    alert('حدث خطأ أثناء تسجيل الدخول باستخدام Google: ' + error.message);
  }
});

// التحقق من كلمة المرور الخاصة لإدارة المدارس
document.getElementById('adminAccessForm').addEventListener('submit', (e) => {
  e.preventDefault();

  const adminPassword = document.getElementById('adminPassword').value.trim();

  // كلمة المرور الخاصة (يمكنك تغييرها حسب الحاجة)
  const correctAdminPassword = 'admin123';

  if (adminPassword === correctAdminPassword) {
    alert('تم التحقق من كلمة المرور. سيتم تحويلك إلى صفحة إدارة المدارس.');
    window.location.href = 'manage-schools.html';
  } else {
    alert('كلمة المرور غير صحيحة. يرجى المحاولة مرة أخرى.');
  }
});