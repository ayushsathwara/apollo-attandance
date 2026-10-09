
const API_URL = "http://localhost/apollo-backend";

const addFacultyForm = document.getElementById("addFacultyForm");
const formMessage = document.getElementById("formMessage");
const submitButton = document.getElementById("submitButton");

document.addEventListener("DOMContentLoaded", checkAdminSession);

async function checkAdminSession() {
    try {
        const response = await fetch(`${API_URL}/admin/check_session.php`, {
            credentials: "include"
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
            window.location.href = "admin-login.html";
            return;
        }
    } catch (error) {
        console.error("Session check failed:", error);
        formMessage.textContent = "Could not verify admin session.";
    }
}

addFacultyForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    formMessage.textContent = "";
    submitButton.disabled = true;
    submitButton.textContent = "Adding Faculty...";

    const facultyData = {
        name: document.getElementById("name").value.trim(),
        email: document.getElementById("email").value.trim(),
        employee_id: document.getElementById("employee_id").value.trim(),
        department: document.getElementById("department").value.trim(),
        password: document.getElementById("password").value
    };

    try {
        const response = await fetch(`${API_URL}/admin/add-faculty.php`, {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(facultyData)
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(data.message || "Could not add faculty.");
        }

        formMessage.textContent = "Faculty added successfully!";
        formMessage.style.color = "#15803d";

        addFacultyForm.reset();

        setTimeout(() => {
            window.location.href = "admin-faculty.html";
        }, 1000);

    } catch (error) {
        formMessage.textContent = error.message;
        formMessage.style.color = "#dc2626";
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = "Add Faculty";
    }
});

// Logout
document.getElementById("logoutButton").addEventListener("click", async function () {
    try {
        const response = await fetch(`${API_URL}/admin/logout.php`, {
            method: "POST",
            credentials: "include"
        });

        const data = await response.json();

        if (response.ok && data.success) {
            window.location.href = "admin-login.html";
        } else {
            alert(data.message || "Logout failed.");
        }
    } catch (error) {
        console.error("Logout failed:", error);
        alert("Could not connect to the server.");
    }
});