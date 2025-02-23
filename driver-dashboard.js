// driver-dashboard.js
import { db } from './firebase-config.js';
import { ref, onValue, set, get, push } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js";

let map;
let marker;

// تهيئة الخريطة
function initMap() {
  map = L.map('map').setView([31.9539, 35.9106], 15); // الموقع الافتراضي

  // إضافة طبقة OpenStreetMap
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap contributors',
  }).addTo(map);

  marker = L.marker([31.9539, 35.9106]).addTo(map); // الموقع الافتراضي
}

// تحديث موقع الحافلة باستخدام GPS
document.getElementById('updateLocation').addEventListener('click', () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          timestamp: Date.now(),
        };

        // تحديث موقع الحافلة الحالي
        const busRef = ref(db, 'drivers/BUS001/location');
        set(busRef, newLocation).then(() => {
          alert('تم تحديث موقع الحافلة بنجاح!');
          updateMarker(newLocation);
        });

        // حفظ النقطة الجديدة في قائمة المسار
        const pathRef = ref(db, 'drivers/BUS001/path');
        push(pathRef, newLocation);
      },
      (error) => {
        console.error('Error getting location:', error.message);
        alert('حدث خطأ أثناء الحصول على الموقع.');
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }
    );
  } else {
    alert('GPS غير مدعوم في هذا الجهاز.');
  }
});

// تحديث علامة الموقع على الخريطة
function updateMarker(location) {
  marker.setLatLng([location.lat, location.lng]);
  map.setView([location.lat, location.lng]);
}

// تحميل قائمة الأطفال
function loadChildren() {
  const childrenRef = ref(db, 'drivers/BUS001/children');
  onValue(childrenRef, (snapshot) => {
    const childrenList = document.getElementById('children');
    childrenList.innerHTML = ''; // مسح القائمة الحالية

    const children = snapshot.val();
    if (children) {
      let presentCount = 0;
      let absentCount = 0;

      Object.keys(children).forEach((nationalId) => {
        const child = children[nationalId];
        const li = document.createElement('li');

        li.innerHTML = `
          <span>${child.name} (${child.nationalId})</span>
          <button data-national-id="${nationalId}" class="toggle-attendance">
            ${child.attendance ? 'حاضر' : 'غائب'}
          </button>
        `;

        childrenList.appendChild(li);

        // تحديث الإحصائيات
        if (child.attendance) {
          presentCount++;
        } else {
          absentCount++;
        }
      });

      // تحديث تقرير الحضور والغياب
      document.getElementById('presentCount').textContent = presentCount;
      document.getElementById('absentCount').textContent = absentCount;

      // إضافة مستمع للأزرار
      document.querySelectorAll('.toggle-attendance').forEach((button) => {
        button.addEventListener('click', toggleAttendance);
      });
    } else {
      childrenList.innerHTML = '<li>لا يوجد أطفال مسجلين.</li>';
    }
  });
}

// تغيير حالة الحضور والغياب
async function toggleAttendance(event) {
  const nationalId = event.target.dataset.nationalId;

  try {
    const childRef = ref(db, `drivers/BUS001/children/${nationalId}`);
    const snapshot = await get(childRef);

    if (snapshot.exists()) {
      const childData = snapshot.val();
      const newStatus = !childData.attendance;

      await set(childRef, {
        ...childData,
        attendance: newStatus,
      });

      alert(`تم تسجيل الطفل كـ ${newStatus ? 'حاضر' : 'غائب'}.`);
      loadChildren(); // إعادة تحميل القائمة بعد التحديث
    } else {
      alert('لم يتم العثور على بيانات الطفل.');
    }
  } catch (error) {
    console.error('حدث خطأ أثناء تحديث حالة الحضور:', error);
    alert('حدث خطأ أثناء تحديث حالة الحضور.');
  }
}

// استدعاء الدالة عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
  initMap();
  loadChildren();
});