// Students management functionality
let students = []
let editingStudentId = null

document.addEventListener("DOMContentLoaded", () => {
  loadStudents()
  loadClasses()
  setupEventListeners()
  setupSidebarAndTheme()
})

function setupEventListeners() {
  document.getElementById("addStudentBtn").addEventListener("click", addStudent)

  document.getElementById("searchStudent").addEventListener("input", filterStudents)
  document.getElementById("classFilterStudents").addEventListener("change", filterStudents)

  // Modal event listeners
  document.querySelector(".close").addEventListener("click", closeModal)
  document.getElementById("saveEditBtn").addEventListener("click", saveEdit)
  document.getElementById("cancelEditBtn").addEventListener("click", closeModal)

  // Close modal when clicking outside
  window.addEventListener("click", (e) => {
    const modal = document.getElementById("editModal")
    if (e.target === modal) {
      closeModal()
    }
  })
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
  renderStudents()
}

function loadClasses() {
  const classes = JSON.parse(localStorage.getItem("classes") || "[]")
  const classSelects = [
    document.getElementById("studentClass"),
    document.getElementById("editStudentClass"),
    document.getElementById("classFilterStudents"),
  ]

  classSelects.forEach((select) => {
    if (select) {
      // Clear existing options except the first one
      while (select.children.length > 1) {
        select.removeChild(select.lastChild)
      }

      classes.forEach((cls) => {
        const option = document.createElement("option")
        option.value = cls.name
        option.textContent = cls.name
        select.appendChild(option)
      })
    }
  })
}

function saveStudents() {
  localStorage.setItem("students", JSON.stringify(students))
}

function addStudent() {
  const name = document.getElementById("studentName").value.trim()
  const roll = document.getElementById("studentRoll").value.trim()
  const gender = document.getElementById("studentGender").value
  const dob = document.getElementById("studentDOB").value
  const parentContact = document.getElementById("parentContact").value.trim()
  const studentClass = document.getElementById("studentClass").value
  const photoFile = document.getElementById("studentPhoto").files[0]

  if (!name || !roll || !gender || !dob || !parentContact || !studentClass) {
    showNotification("Please fill in all required fields", "error")
    return
  }

  // Check if student already exists by name or roll
  if (students.some((student) => student.name.toLowerCase() === name.toLowerCase() || student.roll === roll)) {
    showNotification("Student with this name or roll number already exists", "error")
    return
  }

  const newStudent = {
    id: Date.now(),
    name: name,
    roll: roll,
    gender: gender,
    dob: dob,
    parentContact: parentContact,
    class: studentClass,
    photo: null,
  }

  // Handle photo upload
  if (photoFile) {
    const reader = new FileReader()
    reader.onload = (e) => {
      newStudent.photo = e.target.result
      students.push(newStudent)
      saveStudents()
      renderStudents()
      clearForm()
      showNotification("Student added successfully!")
    }
    reader.readAsDataURL(photoFile)
  } else {
    students.push(newStudent)
    saveStudents()
    renderStudents()
    clearForm()
    showNotification("Student added successfully!")
  }
}

function clearForm() {
  document.getElementById("studentName").value = ""
  document.getElementById("studentRoll").value = ""
  document.getElementById("studentGender").value = ""
  document.getElementById("studentDOB").value = ""
  document.getElementById("parentContact").value = ""
  document.getElementById("studentClass").value = ""
  document.getElementById("studentPhoto").value = ""
}

function renderStudents() {
  const container = document.getElementById("studentsTable")
  const noStudentsMsg = document.getElementById("noStudents")

  if (students.length === 0) {
    container.innerHTML =
      '<div class="no-students" id="noStudents"><p>No students registered yet. Add your first student above.</p></div>'
    return
  }

  let html = ""
  students.forEach((student) => {
    const photoSrc = student.photo || ""
    const photoElement = photoSrc
      ? `<img src="${photoSrc}" alt="${student.name}" class="student-photo">`
      : `<div class="student-photo placeholder">👤</div>`

    html += `
      <div class="student-card">
        ${photoElement}
        <div class="student-info">
          <div class="student-name">${student.name}</div>
          <div class="student-details">
            Roll: ${student.roll} | Class: ${student.class || "N/A"} | Gender: ${student.gender || "N/A"}
            <br>DOB: ${student.dob || "N/A"} | Parent: ${student.parentContact || "N/A"}
          </div>
        </div>
        <div class="student-actions">
          <button class="btn btn-secondary btn-small" onclick="editStudent(${student.id})">Edit</button>
          <button class="btn btn-danger btn-small" onclick="deleteStudent(${student.id})">Delete</button>
        </div>
      </div>
    `
  })

  container.innerHTML = html
}

function filterStudents() {
  const searchTerm = document.getElementById("searchStudent").value.toLowerCase()
  const classFilter = document.getElementById("classFilterStudents").value

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchTerm) || student.roll.toLowerCase().includes(searchTerm)
    const matchesClass = !classFilter || student.class === classFilter

    return matchesSearch && matchesClass
  })

  renderFilteredStudents(filteredStudents)
}

function renderFilteredStudents(filteredStudents) {
  const container = document.getElementById("studentsTable")

  if (filteredStudents.length === 0) {
    container.innerHTML = '<div class="no-students"><p>No students found matching your criteria.</p></div>'
    return
  }

  let html = ""
  filteredStudents.forEach((student) => {
    const photoSrc = student.photo || ""
    const photoElement = photoSrc
      ? `<img src="${photoSrc}" alt="${student.name}" class="student-photo">`
      : `<div class="student-photo placeholder">👤</div>`

    html += `
      <div class="student-card">
        ${photoElement}
        <div class="student-info">
          <div class="student-name">${student.name}</div>
          <div class="student-details">
            Roll: ${student.roll} | Class: ${student.class || "N/A"} | Gender: ${student.gender || "N/A"}
            <br>DOB: ${student.dob || "N/A"} | Parent: ${student.parentContact || "N/A"}
          </div>
        </div>
        <div class="student-actions">
          <button class="btn btn-secondary btn-small" onclick="editStudent(${student.id})">Edit</button>
          <button class="btn btn-danger btn-small" onclick="deleteStudent(${student.id})">Delete</button>
        </div>
      </div>
    `
  })

  container.innerHTML = html
}

function editStudent(id) {
  const student = students.find((s) => s.id === id)
  if (!student) return

  editingStudentId = id
  document.getElementById("editStudentName").value = student.name || ""
  document.getElementById("editStudentRoll").value = student.roll || ""
  document.getElementById("editStudentGender").value = student.gender || ""
  document.getElementById("editStudentDOB").value = student.dob || ""
  document.getElementById("editParentContact").value = student.parentContact || ""
  document.getElementById("editStudentClass").value = student.class || ""

  // Show current photo if exists
  const currentPhotoDiv = document.getElementById("currentPhoto")
  if (student.photo) {
    currentPhotoDiv.innerHTML = `<img src="${student.photo}" alt="Current photo" style="width: 60px; height: 60px; border-radius: 50%; object-fit: cover;">`
  } else {
    currentPhotoDiv.innerHTML = "<p>No photo uploaded</p>"
  }

  document.getElementById("editModal").style.display = "block"
}

function saveEdit() {
  const name = document.getElementById("editStudentName").value.trim()
  const roll = document.getElementById("editStudentRoll").value.trim()
  const gender = document.getElementById("editStudentGender").value
  const dob = document.getElementById("editStudentDOB").value
  const parentContact = document.getElementById("editParentContact").value.trim()
  const studentClass = document.getElementById("editStudentClass").value
  const photoFile = document.getElementById("editStudentPhoto").files[0]

  if (!name || !roll || !gender || !dob || !parentContact || !studentClass) {
    showNotification("Please fill in all required fields", "error")
    return
  }

  // Check if name or roll already exists (excluding current student)
  if (
    students.some(
      (student) =>
        student.id !== editingStudentId && (student.name.toLowerCase() === name.toLowerCase() || student.roll === roll),
    )
  ) {
    showNotification("Student with this name or roll number already exists", "error")
    return
  }

  const studentIndex = students.findIndex((s) => s.id === editingStudentId)
  if (studentIndex !== -1) {
    const updatedStudent = {
      ...students[studentIndex],
      name: name,
      roll: roll,
      gender: gender,
      dob: dob,
      parentContact: parentContact,
      class: studentClass,
    }

    if (photoFile) {
      const reader = new FileReader()
      reader.onload = (e) => {
        updatedStudent.photo = e.target.result
        students[studentIndex] = updatedStudent
        saveStudents()
        renderStudents()
        closeModal()
        showNotification("Student updated successfully!")
      }
      reader.readAsDataURL(photoFile)
    } else {
      students[studentIndex] = updatedStudent
      saveStudents()
      renderStudents()
      closeModal()
      showNotification("Student updated successfully!")
    }
  }
}

function deleteStudent(id) {
  if (confirm("Are you sure you want to delete this student? This will also remove all their attendance records.")) {
    students = students.filter((s) => s.id !== id)
    saveStudents()
    renderStudents()
    showNotification("Student deleted successfully!")
  }
}

function closeModal() {
  document.getElementById("editModal").style.display = "none"
  editingStudentId = null
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
