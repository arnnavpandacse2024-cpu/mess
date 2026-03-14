const allowedDays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const weeklyMenu = [
  { day: "Tuesday", date: "2026-03-18", vegAfternoon: "Rajma (only veg)", nonVegAfternoon: "N/A", vegNight: "Babycorn chili", nonVegNight: "Egg curry" },
  { day: "Wednesday", date: "2026-03-19", vegAfternoon: "Mix veg (only veg)", nonVegAfternoon: "N/A", vegNight: "Paneer Masala", nonVegNight: "Chicken Curry" },
  { day: "Thursday", date: "2026-03-20", vegAfternoon: "Besan curry (only veg)", nonVegAfternoon: "N/A", vegNight: "Chole paneer", nonVegNight: "Egg Curry" },
  { day: "Friday", date: "2026-03-21", vegAfternoon: "Rajma Rice (only veg)", nonVegAfternoon: "N/A", vegNight: "Paneer Masala", nonVegNight: "Fish curry" },
  { day: "Sunday", date: "2026-03-23", vegAfternoon: "Mushroom curry", nonVegAfternoon: "Egg Curry", vegNight: "Paneer Do Pyaza", nonVegNight: "Chicken Butter Masala" },
];

const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const availabilityText = document.getElementById("availabilityText");
const daysWrap = document.getElementById("daysWrap");
const menuGrid = document.getElementById("menuGrid");
const countdownEl = document.getElementById("countdown");
const themeBtn = document.getElementById("themeBtn");
const tokenForm = document.getElementById("tokenForm");
const formMessage = document.getElementById("formMessage");
const toast = document.getElementById("toast");
const toastText = document.getElementById("toastText");
const filterDay = document.getElementById("filterDay");
const filterFood = document.getElementById("filterFood");
const bookingTable = document.querySelector("#bookingTable tbody");
const totalCount = document.getElementById("totalCount");
const vegCount = document.getElementById("vegCount");
const nonVegCount = document.getElementById("nonVegCount");
const exportBtn = document.getElementById("exportBtn");

function formatTime(num) { return num.toString().padStart(2, "0"); }
function updateCountdown() {
  const now = new Date();
  const closeTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
  const diff = closeTime - now;
  if (diff < 0) { countdownEl.innerText = "00:00:00"; return; }
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  countdownEl.innerText = `${formatTime(h)}:${formatTime(m)}:${formatTime(s)}`;
}

function showToast(message) {
  toastText.innerText = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2600);
}

function loadTheme() {
  const stored = localStorage.getItem("messTheme");
  if (stored === "dark") document.body.classList.add("dark");
  themeBtn.innerHTML = document.body.classList.contains("dark") ? "<i class='fa-solid fa-sun'></i> Light Mode" : "<i class='fa-regular fa-moon'></i> Dark Mode";
}

function renderDays() {
  daysWrap.innerHTML = "";
  const today = new Date();
  const todayName = dayNames[today.getDay()];
  availabilityText.innerText = `Booking open today (${todayName}). You can book only for today.`;

  dayNames.forEach((d) => {
    const pill = document.createElement("div");
    pill.className = "day-pill";
    pill.innerHTML = `<strong>${d}</strong><br>Open`;
    daysWrap.appendChild(pill);
  });

  const selectDay = document.getElementById("selectDay");
  for (let i = 0; i < selectDay.options.length; i++) {
    const option = selectDay.options[i];
    if (!option.value) continue;
    option.disabled = option.value !== todayName;
    if (option.value === todayName) selectDay.value = todayName;
  }
}

function renderMenu() {
  menuGrid.innerHTML = "";
  weeklyMenu.forEach((entry) => {
    const card = document.createElement("div");
    card.className = "menu-card";
    card.innerHTML = `<h4>${entry.day} <span style='font-size:.78rem;color:#4f4f4f'>${entry.date}</span></h4>
      <p><strong>Afternoon (Veg):</strong> ${entry.vegAfternoon}</p>
      <p><strong>Night (Veg):</strong> ${entry.vegNight}</p>
      <p><strong>Afternoon (Non-Veg):</strong> ${entry.nonVegAfternoon}</p>
      <p><strong>Night (Non-Veg):</strong> ${entry.nonVegNight}</p>`;
    menuGrid.appendChild(card);
  });
}

function getBookings() {
  const raw = localStorage.getItem("messBookings");
  if (!raw) return [];
  try { return JSON.parse(raw); } catch { return []; }
}

function saveBooking(booking) {
  const bookings = getBookings();
  bookings.unshift(booking);
  localStorage.setItem("messBookings", JSON.stringify(bookings));
}

function buildTokenId() {
  return `HMS-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 900 + 100)}`;
}

function fillTable() {
  const bookings = getBookings();
  const filterByDay = filterDay.value;
  const filterByFood = filterFood.value;
  const filtered = bookings.filter(b => {
    return (filterByDay === "all" || b.day === filterByDay) && (filterByFood === "all" || b.foodType === filterByFood);
  });
  bookingTable.innerHTML = "";
  filtered.forEach((b) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${b.tokenId}</td><td>${b.studentName}</td><td>${b.rollNumber}</td><td>${b.hostelName}</td><td>${b.day}</td><td>${b.mealTime}</td><td>${b.foodType}</td>`;
    bookingTable.appendChild(tr);
  });
  const total = bookings.length;
  const veg = bookings.filter(b => b.foodType === "Veg").length;
  const nonVeg = bookings.filter(b => b.foodType === "Non-Veg").length;
  totalCount.innerText = total;
  vegCount.innerText = veg;
  nonVegCount.innerText = nonVeg;
}

function exportCSV() {
  const bookings = getBookings();
  if (!bookings.length) { showToast("No bookings to export."); return; }
  const header = ["tokenId", "studentName", "rollNumber", "roomNumber", "hostelName", "day", "mealTime", "foodType", "bookedAt"];
  const rows = bookings.map(b => header.map(k => `"${String(b[k] ?? "").replace(/"/g, '""')}"`).join(","));
  const csv = [header.join(","), ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "mess_bookings.csv";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  showToast("CSV exported successfully.");
}

loadTheme();
renderDays();
renderMenu();
fillTable();
updateCountdown();
setInterval(updateCountdown, 1000);

themeBtn.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  localStorage.setItem("messTheme", document.body.classList.contains("dark") ? "dark" : "light");
  loadTheme();
});

tokenForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const form = new FormData(tokenForm);
  const values = {
    studentName: form.get("studentName").trim(),
    rollNumber: form.get("rollNumber").trim(),
    roomNumber: form.get("roomNumber").trim(),
    hostelName: form.get("hostelName"),
    day: form.get("selectDay"),
    mealTime: form.get("mealTime"),
    foodType: form.get("foodType"),
  };
  if (!values.studentName || !values.rollNumber || !values.roomNumber || !values.hostelName || !values.day || !values.mealTime || !values.foodType) {
    formMessage.innerText = "Please complete all fields.";
    formMessage.style.color = "#d03838";
    return;
  }
  const today = dayNames[new Date().getDay()];
  if (values.day !== today) {
    formMessage.innerText = `You can only book token for today (${today}).`;
    formMessage.style.color = "#d03838";
    return;
  }
  const booking = {
    tokenId: buildTokenId(),
    ...values,
    bookedAt: new Date().toISOString(),
  };
  saveBooking(booking);
  fillTable();
  tokenForm.reset();
  formMessage.innerText = "Your mess token has been successfully booked.";
  formMessage.style.color = "#0a7f45";
  showToast(`Hello ${booking.studentName}, your hostel mess token for ${booking.day} ${booking.mealTime} (${booking.foodType}) has been successfully booked.`);
  setTimeout(() => {
    formMessage.innerText = "";
  }, 5000);
});

filterDay.addEventListener("change", fillTable);
filterFood.addEventListener("change", fillTable);
exportBtn.addEventListener("click", exportCSV);
