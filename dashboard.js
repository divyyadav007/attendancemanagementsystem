// Enhanced dashboard functionality with sidebar and theme toggle
document.addEventListener("DOMContentLoaded", () => {
  initializeSidebar()
  initializeThemeToggle()
  loadClassFilter()
  loadDashboardStats()
  loadRecentActivity()
})

function initializeSidebar() {
  const sidebar = document.getElementById("sidebar")
  const sidebarToggle = document.getElementById("sidebarToggle")
  const mainContent = document.querySelector(".main-content")

  sidebarToggle.addEventListener("click", () => {
    if (window.innerWidth <= 768) {
      sidebar.classList.toggle("open")
    } else {
      sidebar.classList.toggle("collapsed")
      mainContent.classList.toggle("expanded")
    }
  })

  // Close sidebar on mobile when clicking outside
  document.addEventListener("click", (e) => {
    if (
      window.innerWidth <= 768 &&
      !sidebar.contains(e.target) &&
      !sidebarToggle.contains(e.target) &&
      sidebar.classList.contains("open")
    ) {
      sidebar.classList.remove("open")
    }
  })
}

function initializeThemeToggle() {
  const themeToggle = document.getElementById("themeToggle")
  const currentTheme = localStorage.getItem("theme") || "light"

  if (currentTheme === "dark") {
    document.body.classList.add("dark-mode")
    themeToggle.textContent = "☀️"
  }

  themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode")
    const isDark = document.body.classList.contains("dark-mode")
    themeToggle.textContent = isDark ? "☀️" : "🌙"
    localStorage.setItem("theme", isDark ? "dark" : "light")
  })
}

function loadClassFilter() {
  const classes = JSON.parse(localStorage.getItem("classes") || "[]")
  const classFilter = document.getElementById("classFilter")

  classFilter.innerHTML = '<option value="">All Classes</option>'
  classes.forEach((cls) => {
    const option = document.createElement("option")
    option.value = cls.id
    option.textContent = `${cls.name} - ${cls.section}`
    classFilter.appendChild(option)
  })

  classFilter.addEventListener("change", loadDashboardStats)
}

function loadDashboardStats() {
  const students = JSON.parse(localStorage.getItem("students") || "[]")
  const selectedClass = document.getElementById("classFilter").value
  const today = new Date().toISOString().split("T")[0]
  const todayAttendance = JSON.parse(localStorage.getItem(`attendance_${today}`) || "[]")

  // Filter students by class if selected
  const filteredStudents = selectedClass ? students.filter((student) => student.classId === selectedClass) : students

  // Update total students
  document.getElementById("totalStudents").textContent = filteredStudents.length

  // Calculate today's attendance stats
  let presentCount = 0
  let absentCount = 0
  let lateCount = 0

  if (todayAttendance.length > 0) {
    const filteredAttendance = selectedClass
      ? todayAttendance.filter((record) => {
          const student = students.find((s) => s.id === record.studentId)
          return student && student.classId === selectedClass
        })
      : todayAttendance

    filteredAttendance.forEach((record) => {
      if (record.status === "Present") {
        presentCount++
      } else if (record.status === "Absent") {
        absentCount++
      } else if (record.status === "Late") {
        lateCount++
      }
    })

    // Students not in attendance record are considered absent
    const markedStudents = filteredAttendance.length
    const unmarkedStudents = filteredStudents.length - markedStudents
    absentCount += unmarkedStudents
  } else {
    // If no attendance marked today, all are considered absent
    absentCount = filteredStudents.length
  }

  document.getElementById("presentToday").textContent = presentCount
  document.getElementById("absentToday").textContent = absentCount
  document.getElementById("lateToday").textContent = lateCount
}

function loadRecentActivity() {
  const recentActivity = document.getElementById("recentActivity")
  const activities = JSON.parse(localStorage.getItem("recentActivities") || "[]")

  if (activities.length === 0) {
    recentActivity.innerHTML = '<p class="no-activity">No recent activity</p>'
    return
  }

  const activityHTML = activities
    .slice(0, 5)
    .map(
      (activity) => `
    <div class="activity-item">
      <div class="activity-text">${activity.text}</div>
      <div class="activity-time">${formatTime(activity.timestamp)}</div>
    </div>
  `,
    )
    .join("")

  recentActivity.innerHTML = activityHTML
}

function addActivity(text) {
  const activities = JSON.parse(localStorage.getItem("recentActivities") || "[]")
  activities.unshift({
    text,
    timestamp: new Date().toISOString(),
  })

  // Keep only last 20 activities
  if (activities.length > 20) {
    activities.splice(20)
  }

  localStorage.setItem("recentActivities", JSON.stringify(activities))
}

function formatTime(timestamp) {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return "Just now"
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  return `${diffDays}d ago`
}
