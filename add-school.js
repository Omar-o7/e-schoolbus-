// add-school.js
import { db } from './firebase-config.js';
import { ref, set } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js";
import bcrypt from 'https://cdn.jsdelivr.net/npm/bcryptjs@2.4.3/dist/bcrypt.min.js';

// إضافة بيانات المدرسة إلى قاعدة البيانات
async function addSchool(schoolName, password) {
  // تشفير كلمة المرور باستخدام bcrypt
  const hashedPassword = await bcrypt.hash(password, 10); // 10 هو عدد الجولات للتشفير

  const schoolRef = ref(db, `schools/${schoolName}`);
  set(schoolRef, {
    name: schoolName,
    password: hashedPassword, // تخزين كلمة المرور المشفرة
    address: "عنوان المدرسة", // إضافة المزيد من التفاصيل
    phone: "+962791234567",
    email: "school@example.com",
  }).then(() => {
    console.log(`تمت إضافة المدرسة "${schoolName}" بنجاح.`);
  }).catch((error) => {
    console.error('حدث خطأ أثناء إضافة المدرسة:', error.message);
  });
}

// إضافة مدارس جديدة
addSchool("مدرسة المستقبل", "future123");
addSchool("مدرسة الأمل", "hope456");