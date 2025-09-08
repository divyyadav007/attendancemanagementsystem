// Reports functionality
let currentDate = ""

document.addEventListener("DOMContentLoaded", () => {
  setupEventListeners()
  setCurrentDate()
})

function setupEventListeners() {
  document.getElementById("reportDate").addEventListener("change", handleDateChange)
}

function setCurrentDate() {
  const today = new Date().toISOString().split("T")[0]
  document.getElementById("reportDate").value = today
  currentDate = today
  loadReport()
}

function handleDateChange() {
  currentDate = document.getElementById("reportDate").value
  loadReport()
}

function loadReport() {
  if (!currentDate) return

  const attendanceData = JSON.parse(localStorage.getItem(`attendance_${currentDate}`) || "[]")

  if (attendanceData.length === 0) {
    showNoDataMessage()
    return
  }

  calculateSummary(attendanceData)
  renderReportTable(attendanceData)
}

function calculateSummary(attendanceData) {
  let presentCount = 0
  let absentCount = 0
  let lateCount = 0

  attendanceData.forEach((record) => {
    switch (record.status) {
      case "Present":
        presentCount++
        break
      case "Absent":
        absentCount++
        break
      case "Late":
        lateCount++
        break
    }
  })

  document.getElementById("totalPresent").textContent = presentCount
  document.getElementById("totalAbsent").textContent = absentCount
  document.getElementById("totalLate").textContent = lateCount

  document.getElementById("reportSummary").style.display = "block"
}

function renderReportTable(attendanceData) {
  const container = document.getElementById("reportTable")
  const noDataMsg = document.getElementById("noDataMessage")

  noDataMsg.style.display = "none"

  let html = `
        <div class="report-table">
            <div class="table-header">
                <span>ID</span>
                <span>Student Name</span>
                <span>Status</span>
            </div>
    `

  attendanceData.forEach((record) => {
    const statusClass = `status-${record.status.toLowerCase()}`
    html += `
            <div class="table-row">
                <span>#${record.studentId}</span>
                <span>${record.name}</span>
                <span class="status-badge ${statusClass}">${record.status}</span>
            </div>
        `
  })

  html += "</div>"
  container.innerHTML = html
}

function showNoDataMessage() {
  document.getElementById("reportSummary").style.display = "none"
  document.getElementById("noDataMessage").style.display = "block"

  const container = document.getElementById("reportTable")
  container.innerHTML = `
        <div class="no-data">
            <p>No attendance record found for this date.</p>
        </div>
    `
}
