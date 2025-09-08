// Attendance marking functionality
let students = []
let currentDate = ""
let currentView = "list"
let currentMonth = new Date().getMonth()
let currentYear = new Date().getFullYear()

document.addEventListener("DOMContentLoaded", () => {
  loadStudents()
  loadClasses()
  setupEventListeners()
  setCurrentDate()
  setupSidebarAndTheme()
})

function setupEventListeners() {
  document.getElementById("attendanceDate").addEventListener("change", handleDateChange)
  document.getElementById("saveAttendanceBtn").addEventListener("click", saveAttendance)
  document.getElementById("markAllPresentBtn").addEventListener("click", markAllPresent)
  document.getElementById("markAllAbsentBtn").addEventListener("click", markAllAbsent)

  document.getElementById("classFilterAttendance").addEventListener("change", filterByClass)

  document.getElementById("listViewBtn").addEventListener("click", () => switchView("list"))
  document.getElementById("calendarViewBtn").addEventListener("click", () => switchView("calendar"))

  document.getElementById("prevMonth").addEventListener("click", () => navigateMonth(-1))
  document.getElementById("nextMonth").addEventListener("click", () => navigateMonth(1))
}

function setupSidebarAndTheme() {
  const sidebarToggle = document.getElementById("sidebarToggle")
  const sidebar = document.getElementById("sidebar")
  const mainContent = document.querySelector(".main-content")
  const themeToggle = document.getElementById("themeToggle")

  sidebarToggle.addEventListener("click", () => {
    sidebar.classList.toggle("collapsed")
    mainContent.classList.toggle("expanded")
  })

  themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode")
    const isDark = document.body.classList.contains("dark-mode")
    themeToggle.textContent = isDark ? "☀️" : "🌙"
    localStorage.setItem("darkMode", isDark)
  })

  // Load saved theme
  if (localStorage.getItem("darkMode") === "true") {
    document.body.classList.add("dark-mode")
    themeToggle.textContent = "☀️"
  }
}

function loadStudents() {
  students = JSON.parse(localStorage.getItem("students") || "[]")
  renderAttendanceTable()
}

function loadClasses() {
  const classes = JSON.parse(localStorage.getItem("classes") || "[]")
  const classFilter = document.getElementById("classFilterAttendance")

  // Clear existing options except the first one
  while (classFilter.children.length > 1) {
    classFilter.removeChild(classFilter.lastChild)
  }

  classes.forEach((cls) => {
    const option = document.createElement("option")
    option.value = cls.name
    option.textContent = cls.name
    classFilter.appendChild(option)
  })
}

function setCurrentDate() {
  const today = new Date().toISOString().split("T")[0]
  document.getElementById("attendanceDate").value = today
  currentDate = today
  loadExistingAttendance()
}

function handleDateChange() {
  currentDate = document.getElementById("attendanceDate").value
  loadExistingAttendance()
}

function renderAttendanceTable() {
  const container = document.getElementById("attendanceTable")
  const noStudentsMsg = document.getElementById("noStudentsMessage")

  if (students.length === 0) {
    noStudentsMsg.style.display = "block"
    return
  }

  noStudentsMsg.style.display = "none"

  let html = `
    <div class="attendance-table">
      <div class="table-header">
        <span>Photo</span>
        <span>Student Details</span>
        <span>Present</span>
        <span>Absent</span>
        <span>Late</span>
      </div>
  `

  students.forEach((student) => {
    const photoSrc = student.photo || ""
    const photoElement = photoSrc
      ? `<img src="${photoSrc}" alt="${student.name}" class="student-photo-small">`
      : `<div class="student-photo-small placeholder">👤</div>`

    html += `
      <div class="table-row attendance-row">
        ${photoElement}
        <div class="student-details-attendance">
          <div class="student-name">${student.name}</div>
          <div class="student-meta">Roll: ${student.roll} | Class: ${student.class || "N/A"}</div>
        </div>
        <div class="status-checkbox">
          <input type="checkbox" id="present_${student.id}" name="status_${student.id}" value="Present" onchange="handleStatusChange(${student.id}, 'Present')">
        </div>
        <div class="status-checkbox">
          <input type="checkbox" id="absent_${student.id}" name="status_${student.id}" value="Absent" onchange="handleStatusChange(${student.id}, 'Absent')">
        </div>
        <div class="status-checkbox">
          <input type="checkbox" id="late_${student.id}" name="status_${student.id}" value="Late" onchange="handleStatusChange(${student.id}, 'Late')">
        </div>
      </div>
    `
  })

  html += "</div>"
  container.innerHTML = html
  loadExistingAttendance()
}

function handleStatusChange(studentId, status) {
  // Uncheck other checkboxes for this student
  const checkboxes = document.querySelectorAll(`input[name="status_${studentId}"]`)
  checkboxes.forEach((cb) => {
    if (cb.value !== status) {
      cb.checked = false
    }
  })
}

function filterByClass() {
  const selectedClass = document.getElementById("classFilterAttendance").value
  const filteredStudents = selectedClass ? students.filter((student) => student.class === selectedClass) : students

  renderFilteredAttendanceTable(filteredStudents)
}

function renderFilteredAttendanceTable(filteredStudents) {
  const container = document.getElementById("attendanceTable")

  if (filteredStudents.length === 0) {
    container.innerHTML = '<div class="no-students"><p>No students found for the selected class.</p></div>'
    return
  }

  let html = `
    <div class="attendance-table">
      <div class="table-header">
        <span>Photo</span>
        <span>Student Details</span>
        <span>Present</span>
        <span>Absent</span>
        <span>Late</span>
      </div>
  `

  filteredStudents.forEach((student) => {
    const photoSrc = student.photo || ""
    const photoElement = photoSrc
      ? `<img src="${photoSrc}" alt="${student.name}" class="student-photo-small">`
      : `<div class="student-photo-small placeholder">👤</div>`

    html += `
      <div class="table-row attendance-row">
        ${photoElement}
        <div class="student-details-attendance">
          <div class="student-name">${student.name}</div>
          <div class="student-meta">Roll: ${student.roll} | Class: ${student.class || "N/A"}</div>
        </div>
        <div class="status-checkbox">
          <input type="checkbox" id="present_${student.id}" name="status_${student.id}" value="Present" onchange="handleStatusChange(${student.id}, 'Present')">
        </div>
        <div class="status-checkbox">
          <input type="checkbox" id="absent_${student.id}" name="status_${student.id}" value="Absent" onchange="handleStatusChange(${student.id}, 'Absent')">
        </div>
        <div class="status-checkbox">
          <input type="checkbox" id="late_${student.id}" name="status_${student.id}" value="Late" onchange="handleStatusChange(${student.id}, 'Late')">
        </div>
      </div>
    `
  })

  html += "</div>"
  container.innerHTML = html
  loadExistingAttendance()
}

function loadExistingAttendance() {
  if (!currentDate) return

  const existingAttendance = JSON.parse(localStorage.getItem(`attendance_${currentDate}`) || "[]")

  // Reset all checkboxes
  students.forEach((student) => {
    const checkboxes = document.querySelectorAll(`input[name="status_${student.id}"]`)
    checkboxes.forEach((checkbox) => (checkbox.checked = false))
  })

  // Set existing attendance
  existingAttendance.forEach((record) => {
    const checkbox = document.getElementById(`${record.status.toLowerCase()}_${record.studentId}`)
    if (checkbox) {
      checkbox.checked = true
    }
  })
}

function saveAttendance() {
  if (!currentDate) {
    showNotification("Please select a date", "error")
    return
  }

  const attendanceData = []

  students.forEach((student) => {
    const presentBox = document.getElementById(`present_${student.id}`)
    const absentBox = document.getElementById(`absent_${student.id}`)
    const lateBox = document.getElementById(`late_${student.id}`)

    let status = "Absent" // Default status
    if (presentBox && presentBox.checked) status = "Present"
    else if (lateBox && lateBox.checked) status = "Late"
    else if (absentBox && absentBox.checked) status = "Absent"

    attendanceData.push({
      studentId: student.id,
      name: student.name,
      roll: student.roll,
      class: student.class,
      status: status,
    })
  })

  localStorage.setItem(`attendance_${currentDate}`, JSON.stringify(attendanceData))
  showNotification("Attendance saved successfully!")
}

function markAllPresent() {
  students.forEach((student) => {
    const presentCheckbox = document.getElementById(`present_${student.id}`)
    const absentCheckbox = document.getElementById(`absent_${student.id}`)
    const lateCheckbox = document.getElementById(`late_${student.id}`)

    if (presentCheckbox) {
      presentCheckbox.checked = true
      if (absentCheckbox) absentCheckbox.checked = false
      if (lateCheckbox) lateCheckbox.checked = false
    }
  })
  showNotification("All students marked as present")
}

function markAllAbsent() {
  students.forEach((student) => {
    const presentCheckbox = document.getElementById(`present_${student.id}`)
    const absentCheckbox = document.getElementById(`absent_${student.id}`)
    const lateCheckbox = document.getElementById(`late_${student.id}`)

    if (absentCheckbox) {
      absentCheckbox.checked = true
      if (presentCheckbox) presentCheckbox.checked = false
      if (lateCheckbox) lateCheckbox.checked = false
    }
  })
  showNotification("All students marked as absent")
}

function switchView(view) {
  currentView = view
  const listView = document.getElementById("listView")
  const calendarView = document.getElementById("calendarView")
  const listBtn = document.getElementById("listViewBtn")
  const calendarBtn = document.getElementById("calendarViewBtn")

  if (view === "list") {
    listView.style.display = "block"
    calendarView.style.display = "none"
    listBtn.classList.add("active")
    calendarBtn.classList.remove("active")
  } else {
    listView.style.display = "none"
    calendarView.style.display = "block"
    listBtn.classList.remove("active")
    calendarBtn.classList.add("active")
    renderCalendar()
  }
}

function renderCalendar() {
  const calendar = document.getElementById("calendar")
  const monthHeader = document.getElementById("currentMonth")

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  monthHeader.textContent = `${monthNames[currentMonth]} ${currentYear}`

  const firstDay = new Date(currentYear, currentMonth, 1).getDay()
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()

  let html = `
    <div class="calendar-days">
      <div class="day-header">Sun</div>
      <div class="day-header">Mon</div>
      <div class="day-header">Tue</div>
      <div class="day-header">Wed</div>
      <div class="day-header">Thu</div>
      <div class="day-header">Fri</div>
      <div class="day-header">Sat</div>
    </div>
    <div class="calendar-dates">
  `

  // Empty cells for days before month starts
  for (let i = 0; i < firstDay; i++) {
    html += '<div class="calendar-date empty"></div>'
  }

  // Days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
    const attendance = JSON.parse(localStorage.getItem(`attendance_${dateStr}`) || "[]")

    let statusClass = ""
    if (attendance.length > 0) {
      const presentCount = attendance.filter((a) => a.status === "Present").length
      const totalCount = attendance.length
      const percentage = (presentCount / totalCount) * 100

      if (percentage >= 80) statusClass = "high-attendance"
      else if (percentage >= 50) statusClass = "medium-attendance"
      else statusClass = "low-attendance"
    }

    const isToday = dateStr === new Date().toISOString().split("T")[0]
    const todayClass = isToday ? "today" : ""

    html += `<div class="calendar-date ${statusClass} ${todayClass}" onclick="selectCalendarDate('${dateStr}')">${day}</div>`
  }

  html += "</div>"
  calendar.innerHTML = html
}

function selectCalendarDate(dateStr) {
  document.getElementById("attendanceDate").value = dateStr
  currentDate = dateStr
  switchView("list")
  loadExistingAttendance()
}

function navigateMonth(direction) {
  currentMonth += direction
  if (currentMonth > 11) {
    currentMonth = 0
    currentYear++
  } else if (currentMonth < 0) {
    currentMonth = 11
    currentYear--
  }
  renderCalendar()
}

function showNotification(message, type = "success") {
  const notification = document.getElementById("notification")
  notification.textContent = message
  notification.className = `notification ${type}`
  notification.classList.add("show")

  setTimeout(() => {
    notification.classList.remove("show")
  }, 3000)
}
