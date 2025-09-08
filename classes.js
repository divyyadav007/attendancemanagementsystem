// Classes management functionality
let classes = []
let editingClassId = null

document.addEventListener("DOMContentLoaded", () => {
  loadClasses()
  setupEventListeners()
  initializeTheme()
  setupSidebar()
})

function setupEventListeners() {
  document.getElementById("addClassBtn").addEventListener("click", addClass)
  document.getElementById("className").addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      addClass()
    }
  })

  // Modal event listeners
  document.querySelector(".close").addEventListener("click", closeModal)
  document.getElementById("saveClassEditBtn").addEventListener("click", saveEdit)
  document.getElementById("cancelClassEditBtn").addEventListener("click", closeModal)

  // Close modal when clicking outside
  window.addEventListener("click", (e) => {
    const modal = document.getElementById("editClassModal")
    if (e.target === modal) {
      closeModal()
    }
  })
}

function loadClasses() {
  classes = JSON.parse(localStorage.getItem("classes") || "[]")
  renderClasses()
}

function saveClasses() {
  localStorage.setItem("classes", JSON.stringify(classes))
}

function addClass() {
  const nameInput = document.getElementById("className")
  const name = nameInput.value.trim()

  if (!name) {
    showNotification("Please enter a class name", "error")
    return
  }

  // Check if class already exists
  if (classes.some((cls) => cls.name.toLowerCase() === name.toLowerCase())) {
    showNotification("Class already exists", "error")
    return
  }

  const newClass = {
    id: Date.now(),
    name: name,
    createdAt: new Date().toISOString(),
  }

  classes.push(newClass)
  saveClasses()
  renderClasses()
  nameInput.value = ""
  showNotification("Class added successfully!")
}

function renderClasses() {
  const container = document.getElementById("classesTable")
  const noClassesMsg = document.getElementById("noClasses")

  if (classes.length === 0) {
    container.innerHTML =
      '<div class="no-classes" id="noClasses"><p>No classes created yet. Add your first class above.</p></div>'
    return
  }

  let html = `
    <div class="classes-table">
      <div class="table-header">
        <span>Class Name</span>
        <span>Students</span>
        <span>Actions</span>
      </div>
  `

  classes.forEach((cls) => {
    const students = JSON.parse(localStorage.getItem("students") || "[]")
    const classStudents = students.filter((s) => s.class === cls.name)

    html += `
      <div class="table-row">
        <span>${cls.name}</span>
        <span>${classStudents.length} students</span>
        <div class="action-buttons">
          <button class="btn btn-secondary" onclick="editClass(${cls.id})">Edit</button>
          <button class="btn btn-danger" onclick="deleteClass(${cls.id})">Delete</button>
        </div>
      </div>
    `
  })

  html += "</div>"
  container.innerHTML = html
}

function editClass(id) {
  const cls = classes.find((c) => c.id === id)
  if (!cls) return

  editingClassId = id
  document.getElementById("editClassName").value = cls.name
  document.getElementById("editClassModal").style.display = "block"
}

function saveEdit() {
  const newName = document.getElementById("editClassName").value.trim()

  if (!newName) {
    showNotification("Please enter a class name", "error")
    return
  }

  // Check if name already exists (excluding current class)
  if (classes.some((cls) => cls.id !== editingClassId && cls.name.toLowerCase() === newName.toLowerCase())) {
    showNotification("Class name already exists", "error")
    return
  }

  const classIndex = classes.findIndex((c) => c.id === editingClassId)
  if (classIndex !== -1) {
    const oldName = classes[classIndex].name
    classes[classIndex].name = newName

    // Update students' class references
    const students = JSON.parse(localStorage.getItem("students") || "[]")
    students.forEach((student) => {
      if (student.class === oldName) {
        student.class = newName
      }
    })
    localStorage.setItem("students", JSON.stringify(students))

    saveClasses()
    renderClasses()
    closeModal()
    showNotification("Class updated successfully!")
  }
}

function deleteClass(id) {
  const cls = classes.find((c) => c.id === id)
  if (!cls) return

  const students = JSON.parse(localStorage.getItem("students") || "[]")
  const classStudents = students.filter((s) => s.class === cls.name)

  if (classStudents.length > 0) {
    if (
      !confirm(
        `This class has ${classStudents.length} students. Deleting it will remove the class assignment from these students. Continue?`,
      )
    ) {
      return
    }

    // Remove class assignment from students
    students.forEach((student) => {
      if (student.class === cls.name) {
        student.class = ""
      }
    })
    localStorage.setItem("students", JSON.stringify(students))
  }

  classes = classes.filter((c) => c.id !== id)
  saveClasses()
  renderClasses()
  showNotification("Class deleted successfully!")
}

function closeModal() {
  document.getElementById("editClassModal").style.display = "none"
  editingClassId = null
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

// Theme and sidebar functionality
function initializeTheme() {
  const savedTheme = localStorage.getItem("theme") || "light"
  document.documentElement.setAttribute("data-theme", savedTheme)

  const themeToggle = document.getElementById("themeToggle")
  themeToggle.textContent = savedTheme === "dark" ? "☀️" : "🌙"

  themeToggle.addEventListener("click", () => {
    const currentTheme = document.documentElement.getAttribute("data-theme")
    const newTheme = currentTheme === "dark" ? "light" : "dark"

    document.documentElement.setAttribute("data-theme", newTheme)
    localStorage.setItem("theme", newTheme)
    themeToggle.textContent = newTheme === "dark" ? "☀️" : "🌙"
  })
}

function setupSidebar() {
  const sidebar = document.getElementById("sidebar")
  const sidebarToggle = document.getElementById("sidebarToggle")

  sidebarToggle.addEventListener("click", () => {
    sidebar.classList.toggle("collapsed")
  })
}
