
const API_URL = "http://localhost/apollo-backend";

const form = document.getElementById("addParentForm");
const studentSelect = document.getElementById("studentId");
const formMessage = document.getElementById("formMessage");
const submitButton = document.getElementById("submitButton");

// Load admin session and students
document.addEventListener("DOMContentLoaded", initializePage);

async function initializePage() {
    await checkAdminSession();
}

async function checkAdminSession() {
    try {
        const response = await fetch(
            `${API_URL}/admin/check_session.php`,
            { credentials: "include" }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
            window.location.href = "admin-login.html";
            return;
        }

        document.getElementById("adminName").textContent =
            data.admin.name;

        document.getElementById("adminEmail").textContent =
            data.admin.email;

        await loadStudents();

    } catch (error) {
        console.error("Session Error:", error);

        showMessage("Could not verify admin session.", false);
    }
}

// Load existing students into dropdown
async function loadStudents() {
    studentSelect.innerHTML =
        '<option value="">Loading students...</option>';

    try {
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
            throw new Error(data.message || "Could not load students.");
        }

        studentSelect.replaceChildren();

        const defaultOption = document.createElement("option");
        defaultOption.value = "";
        defaultOption.textContent = "Select Student";
        studentSelect.appendChild(defaultOption);

        data.students.forEach(function (student) {
            const option = document.createElement("option");

            option.value = student.id;

            option.textContent =
                `${student.name} - ${student.roll_no} (${student.course})`;

            studentSelect.appendChild(option);
        });

        if (data.students.length === 0) {
            studentSelect.innerHTML =
                '<option value="">No students available</option>';
        }

    } catch (error) {
        console.error("Student Loading Error:", error);

        studentSelect.innerHTML =
            '<option value="">Unable to load students</option>';

        showMessage(error.message, false);
    }
}

// Show success or error message
function showMessage(message, success) {
    formMessage.textContent = message;
    formMessage.style.color = success ? "#15803d" : "#dc2626";
}

// Create parent account
form.addEventListener("submit", async function (event) {
    event.preventDefault();

    formMessage.textContent = "";

    submitButton.disabled = true;
    submitButton.textContent = "Creating Account...";

    const parentData = {
        student_id: studentSelect.value,
        name: document.getElementById("parentName").value.trim(),
        email: document.getElementById("parentEmail").value.trim(),
        phone: document.getElementById("parentPhone").value.trim(),
        password: document.getElementById("parentPassword").value
    };

    try {
        const response = await fetch(
            `${API_URL}/admin/add-parent.php`,
            {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(parentData)
            }
        );

        const data = await response.json();

        if (response.status === 401) {
            window.location.href = "admin-login.html";
            return;
        }

        if (!response.ok || !data.success) {
            throw new Error(data.message || "Could not create parent account.");
        }

        showMessage(data.message, true);

        form.reset();

        setTimeout(function () {
            window.location.href = "admin-students.html";
        }, 1500);

    } catch (error) {
        console.error("Add Parent Error:", error);

        showMessage(error.message, false);

    } finally {
        submitButton.disabled = false;
        submitButton.textContent = "Create Parent Account";
    }
});

// Admin logout
document.getElementById("logoutButton").addEventListener(
    "click",
    async function () {
        try {
            const response = await fetch(
                `${API_URL}/admin/logout.php`,
                {
                    method: "POST",
                    credentials: "include"
                }
            );

            const data = await response.json();

            if (response.ok && data.success) {
                window.location.href = "admin-login.html";
            } else {
                alert(data.message || "Logout failed.");
            }

        } catch (error) {
            console.error("Logout Error:", error);
            alert("Could not connect to the server.");
        }
    }
);
