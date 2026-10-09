const API_URL = "http://localhost/apollo-backend";

let allStudents = [];

document.addEventListener("DOMContentLoaded", function () {
    loadStudents();

    document.getElementById("studentSearch").addEventListener("input", function () {
        displayStudents(this.value);
    });

    document.getElementById("logoutButton").addEventListener("click", logoutAdmin);

    document.getElementById("facultyLink").addEventListener("click", function (event) {
        event.preventDefault();
        alert("Faculty Management will be implemented next.");
    });
});

async function loadStudents() {
    const tableBody = document.getElementById("studentTableBody");
    const message = document.getElementById("pageMessage");

    tableBody.innerHTML = `
        <tr>
            <td colspan="7">Loading students...</td>
        </tr>
    `;

    try {
        const sessionResponse = await fetch(
            `${API_URL}/admin/check_session.php`,
            { credentials: "include" }
        );

        const sessionData = await sessionResponse.json();

        if (!sessionResponse.ok || !sessionData.success) {
            window.location.href = "admin-login.html";
            return;
        }

        document.getElementById("adminName").textContent =
            sessionData.admin.name;

        document.getElementById("adminEmail").textContent =
            sessionData.admin.email;

        const response = await fetch(
            `${API_URL}/admin/students.php`,
            { credentials: "include" }
        );

        if (response.status === 401) {
            window.location.href = "admin-login.html";
            return;
        }

        const data = await response.json();

        if (!response.ok || !data.success || !Array.isArray(data.students)) {
            throw new Error(data.message || "Could not load student records.");
        }

        allStudents = data.students;

        document.getElementById("studentCount").textContent =
            allStudents.length;

        message.textContent = "";
        displayStudents(document.getElementById("studentSearch").value);

    } catch (error) {
        console.error("Student Loading Error:", error);

        tableBody.replaceChildren();

        const row = document.createElement("tr");
        const cell = document.createElement("td");
        cell.colSpan = 7;
        cell.textContent = "Unable to load students.";
        row.appendChild(cell);
        tableBody.appendChild(row);

        message.textContent =
            error.message || "Check XAMPP and the backend API.";
        message.style.color = "#dc2626";
    }
}

function displayStudents(searchText) {
    const tableBody = document.getElementById("studentTableBody");
    const search = searchText.trim().toLowerCase();

    const filteredStudents = allStudents.filter(function (student) {
        return (
            String(student.name || "").toLowerCase().includes(search) ||
            String(student.email || "").toLowerCase().includes(search) ||
            String(student.roll_no || "").toLowerCase().includes(search)
        );
    });

    tableBody.replaceChildren();

    if (filteredStudents.length === 0) {
        const row = document.createElement("tr");
        const cell = document.createElement("td");

        cell.colSpan = 7;
        cell.textContent = "No students found.";

        row.appendChild(cell);
        tableBody.appendChild(row);
        return;
    }

    filteredStudents.forEach(function (student) {
        const row = document.createElement("tr");

        [
            student.id,
            student.name,
            student.email,
            student.roll_no,
            student.course,
            student.semester
        ].forEach(function (value) {
            const cell = document.createElement("td");
            cell.textContent = value ?? "—";
            row.appendChild(cell);
        });

        // Create Delete button
        const actionCell = document.createElement("td");
        const deleteButton = document.createElement("button");

        deleteButton.type = "button";
        deleteButton.textContent = "Delete";
        deleteButton.className = "delete-student-button";

        deleteButton.addEventListener("click", function () {
            deleteStudent(student.id, student.name, deleteButton);
        });

        actionCell.appendChild(deleteButton);
        row.appendChild(actionCell);
        tableBody.appendChild(row);
    });
}

async function deleteStudent(studentId, studentName, button) {
    const confirmed = confirm(
        `Are you sure you want to delete ${studentName}?\n\nThis action cannot be undone.`
    );

    if (!confirmed) {
        return;
    }

    const message = document.getElementById("pageMessage");

    button.disabled = true;
    button.textContent = "Deleting...";
    message.textContent = "";

    try {
        const response = await fetch(
            `${API_URL}/admin/delete-student.php`,
            {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    student_id: studentId
                })
            }
        );

        const data = await response.json();

        if (response.status === 401) {
            window.location.href = "admin-login.html";
            return;
        }

        if (!response.ok || !data.success) {
            throw new Error(data.message || "Could not delete student.");
        }

        allStudents = allStudents.filter(function (student) {
            return String(student.id) !== String(studentId);
        });

        document.getElementById("studentCount").textContent =
            allStudents.length;

        displayStudents(document.getElementById("studentSearch").value);

        message.textContent = data.message || "Student deleted successfully.";
        message.style.color = "#15803d";

    } catch (error) {
        console.error("Delete Student Error:", error);

        message.textContent =
            error.message || "Unable to delete student.";
        message.style.color = "#dc2626";

        button.disabled = false;
        button.textContent = "Delete";
    }
}

async function logoutAdmin() {
    try {
        const response = await fetch(`${API_URL}/admin/logout.php`, {
            method: "POST",
            credentials: "include"
        });

        if (!response.ok) {
            throw new Error("Logout failed.");
        }

        window.location.href = "admin-login.html";

    } catch (error) {
        console.error("Logout Error:", error);
        alert("Unable to log out. Please check the server.");
    }
}