// parent-dashboard.js
import { db } from './firebase-config.js';
import { ref, onValue, set, get } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js";

let map;
let marker;
let polyline;

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

// حساب المسافة بين موقعين باستخدام صيغة Haversine
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // نصف قطر الأرض بالكيلومترات
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c * 1000; // المسافة بالأمتار
}

function toRadians(degrees) {
  return degrees * (Math.PI / 180);
}

// التحقق من قرب الحافلة من موقع ولي الأمر
function checkProximity(busLocation) {
  const parentLocation = {
    lat: 31.9600, // استبدل هذا بالموقع الفعلي لولي الأمر
    lng: 35.9200,
  };

  const notificationDistance = parseInt(document.getElementById('notificationDistance').value, 10);

  const distance = calculateDistance(
    busLocation.lat,
    busLocation.lng,
    parentLocation.lat,
    parentLocation.lng
  );

  if (distance <= notificationDistance) { // إذا كانت المسافة أقل من المسافة المخصصة
    alert(`الحافلة قريبة من موقعك! المسافة: ${Math.round(distance)} متر.`);
  }
}

// تحميل قائمة الأبناء
function loadChildren(phone) {
  const childrenRef = ref(db, `parents/${phone}/children`);
  onValue(childrenRef, (snapshot) => {
    const childrenList = document.getElementById('children');
    childrenList.innerHTML = ''; // مسح القائمة الحالية

    const children = snapshot.val();
    if (children) {
      Object.keys(children).forEach((nationalId) => {
        const child = children[nationalId];
        const li = document.createElement('li');

        li.innerHTML = `
          <span>${child.name} (${child.nationalId})</span>
          <button data-national-id="${nationalId}" class="toggle-child-status">
            ${child.isActive ? 'تعطيل' : 'تفعيل'}
          </button>
        `;

        childrenList.appendChild(li);
      });

      // إضافة مستمع للأزرار
      document.querySelectorAll('.toggle-child-status').forEach((button) => {
        button.addEventListener('click', toggleChildStatus);
      });
    } else {
      childrenList.innerHTML = '<li>لا يوجد أبناء مسجلين.</li>';
    }
  });
}

// تفعيل أو تعطيل الطفل
async function toggleChildStatus(event) {
  const nationalId = event.target.dataset.nationalId;
  const phone = new URLSearchParams(window.location.search).get('phone'); // استخراج رقم الهاتف من الرابط

  try {
    const childRef = ref(db, `parents/${phone}/children/${nationalId}`);
    const snapshot = await get(childRef);

    if (snapshot.exists()) {
      const childData = snapshot.val();
      const newStatus = !childData.isActive;

      await set(childRef, {
        ...childData,
        isActive: newStatus,
      });

      alert(`تم ${newStatus ? 'تفعيل' : 'تعطيل'} الطفل بنجاح.`);
      loadChildren(phone); // إعادة تحميل القائمة بعد التحديث
    } else {
      alert('لم يتم العثور على بيانات الطفل.');
    }
  } catch (error) {
    console.error('حدث خطأ أثناء تحديث حالة الطفل:', error);
    alert('حدث خطأ أثناء تحديث حالة الطفل.');
  }
}

// تفعيل الطفل باستخدام الرقم الوطني
document.getElementById('activateChildForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const childNationalId = document.getElementById('childNationalId').value.trim();
  const phone = new URLSearchParams(window.location.search).get('phone'); // استخراج رقم الهاتف من الرابط

  if (!childNationalId || !phone) {
    alert('يرجى إدخال الرقم الوطني للطفل.');
    return;
  }

  try {
    const childrenRef = ref(db, `parents/${phone}/children`);
    const snapshot = await get(childrenRef);

    if (snapshot.exists()) {
      const children = snapshot.val();

      // البحث عن الطفل باستخدام الرقم الوطني
      const child = Object.values(children).find((child) => child.nationalId === childNationalId);

      if (child) {
        const childRef = ref(db, `parents/${phone}/children/${childNationalId}`);

        await set(childRef, {
          ...child,
          isActive: true,
        });

        alert(`تم تفعيل الطفل بنجاح.`);
        loadChildren(phone); // إعادة تحميل القائمة بعد التحديث
      } else {
        alert('الرقم الوطني غير صحيح أو الطفل غير مسجل.');
      }
    } else {
      alert('لم يتم العثور على أي أبناء مسجلين.');
    }
  } catch (error) {
    console.error('حدث خطأ أثناء تفعيل الطفل:', error);
    alert('حدث خطأ أثناء تفعيل الطفل.');
  }
});

// استدعاء الدالة عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
  initMap();

  // استرداد موقع الحافلة الحالي
  const busLocationRef = ref(db, 'drivers/BUS001/location'); // استبدل BUS001 برقم الحافلة
  onValue(busLocationRef, (snapshot) => {
    const busLocation = snapshot.val();
    if (busLocation) {
      marker.setLatLng([busLocation.lat, busLocation.lng]);
      map.setView([busLocation.lat, busLocation.lng]);

      // التحقق من قرب الحافلة من موقع ولي الأمر
      checkProximity(busLocation);
    }
  });

  // استرداد المسار الكامل للحافلة
  const pathRef = ref(db, 'drivers/BUS001/path');
  onValue(pathRef, (snapshot) => {
    const pathData = snapshot.val();
    if (pathData) {
      const points = Object.values(pathData).map(point => [point.lat, point.lng]);

      // إزالة الخط القديم إذا كان موجودًا
      if (polyline) {
        map.removeLayer(polyline);
      }

      // رسم خط جديد يمثل المسار الكامل
      polyline = L.polyline(points, { color: 'blue' }).addTo(map);
      map.fitBounds(polyline.getBounds()); // ضبط الخريطة لتغطية المسار بالكامل
    }
  });

  // تحميل قائمة الأبناء
  const urlParams = new URLSearchParams(window.location.search);
  const parentPhone = urlParams.get('phone');
  if (parentPhone) {
    loadChildren(parentPhone);
  } else {
    alert('لم يتم العثور على بيانات ولي الأمر.');
  }
});