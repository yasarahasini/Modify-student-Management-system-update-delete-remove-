let db;

// Open IndexedDB
const request = indexedDB.open("StudentDB", 1);

request.onupgradeneeded = function(event) {
    let db = event.target.result;
    let objectStore = db.createObjectStore("students", { keyPath: "id", autoIncrement: true });
    objectStore.createIndex("name", "name", { unique: false });
};

request.onsuccess = function(event) {
    db = event.target.result;
    loadStudents();
};

request.onerror = function() {
    console.log("Database error");
};

// Function to add or update a student
function addOrUpdateStudent() {
    let studentId = document.getElementById("studentId").value;
    let name = document.getElementById("name").value;
    let age = document.getElementById("age").value;
    let course = document.getElementById("course").value;
    let email = document.getElementById("email").value;

    if (!name || !age || !course || !email) {
        alert("All fields are required!");
        return;
    }

    let transaction = db.transaction(["students"], "readwrite");
    let objectStore = transaction.objectStore("students");

    if (studentId) {
        // Update student
        let updatedStudent = { id: Number(studentId), name, age, course, email };
        let request = objectStore.put(updatedStudent);
        request.onsuccess = function() {
            clearForm();
            loadStudents();
        };
    } else {
        // Add new student
        let newStudent = { name, age, course, email };
        let request = objectStore.add(newStudent);
        request.onsuccess = function() {
            clearForm();
            loadStudents();
        };
    }
}

// Function to load students from IndexedDB
function loadStudents() {
    let transaction = db.transaction(["students"], "readonly");
    let objectStore = transaction.objectStore("students");

    let studentList = document.getElementById("student-list");
    studentList.innerHTML = "";

    objectStore.openCursor().onsuccess = function(event) {
        let cursor = event.target.result;
        if (cursor) {
            let row = document.createElement("tr");
            row.innerHTML = `
                <td>${cursor.value.name}</td>
                <td>${cursor.value.age}</td>
                <td>${cursor.value.course}</td>
                <td>${cursor.value.email}</td>
                <td>
                    <button class="edit-btn" onclick="editStudent(${cursor.key})">Edit</button>
                    <button class="delete-btn" onclick="deleteStudent(${cursor.key})">Delete</button>
                </td>
            `;
            studentList.appendChild(row);
            cursor.continue();
        }
    };
}

// Function to edit a student
function editStudent(id) {
    let transaction = db.transaction(["students"], "readonly");
    let objectStore = transaction.objectStore("students");

    let request = objectStore.get(id);
    request.onsuccess = function() {
        let student = request.result;
        document.getElementById("studentId").value = student.id;
        document.getElementById("name").value = student.name;
        document.getElementById("age").value = student.age;
        document.getElementById("course").value = student.course;
        document.getElementById("email").value = student.email;
        document.getElementById("addBtn").innerText = "Update Student";
    };
}

// Function to delete a student
function deleteStudent(id) {
    let transaction = db.transaction(["students"], "readwrite");
    let objectStore = transaction.objectStore("students");

    objectStore.delete(id).onsuccess = function() {
        loadStudents();
    };
}

// Function to clear form after adding/updating
function clearForm() {
    document.getElementById("studentId").value = "";
    document.getElementById("name").value = "";
    document.getElementById("age").value = "";
    document.getElementById("course").value = "";
    document.getElementById("email").value = "";
    document.getElementById("addBtn").innerText = "Add Student";
}
