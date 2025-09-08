// Classes management functionality
let classes = []
let editingClassId = null

/**
 * Initializes the classes page after the DOM is fully loaded.
 */
document.addEventListener("DOMContentLoaded", () => {
  loadClasses()
  setupEventListeners()
  setupSidebar()
});

/**
 * Sets up all event listeners for the classes page.
 */
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

/**
 * Loads the list of classes from localStorage and renders them.
 */
function loadClasses() {
  classes = JSON.parse(localStorage.getItem("classes") || "[]")
  renderClasses()
}

/**
 * Saves the current list of classes to localStorage.
 */
function saveClasses() {
  localStorage.setItem("classes", JSON.stringify(classes))
}

/**
 * Adds a new class to the list.
 */
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

/**
 * Renders the list of classes into the DOM.
 */
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

/**
 * Opens the edit modal for a specific class.
 * @param {number} id - The ID of the class to edit.
 */
function editClass(id) {
  const cls = classes.find((c) => c.id === id)
  if (!cls) return

  editingClassId = id
  document.getElementById("editClassName").value = cls.name
  document.getElementById("editClassModal").style.display = "block"
}

/**
 * Saves the changes made to a class in the edit modal.
 */
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

/**
 * Deletes a class from the list.
 * @param {number} id - The ID of the class to delete.
 */
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

/**
 * Closes the edit class modal.
 */
function closeModal() {
  document.getElementById("editClassModal").style.display = "none"
  editingClassId = null
}

/**
 * Shows a notification message.
 * @param {string} message - The message to display.
 * @param {string} [type="success"] - The type of notification ('success' or 'error').
 */
function showNotification(message, type = "success") {
  const notification = document.getElementById("notification")
  notification.textContent = message
  notification.className = `notification ${type}`
  notification.classList.add("show")

  setTimeout(() => {
    notification.classList.remove("show")
  }, 3000)
}

/**
 * Sets up the sidebar toggle functionality.
 */
function setupSidebar() {
  const sidebar = document.getElementById("sidebar")
  const sidebarToggle = document.getElementById("sidebarToggle")
  const mainContent = document.querySelector(".main-content")

  sidebarToggle.addEventListener("click", () => {
    sidebar.classList.toggle("collapsed")
    mainContent.classList.toggle("expanded")
  })
}
