
const API_URL = "http://localhost/apollo-backend";

document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("addStudentForm");
    const message = document.getElementById("formMessage");
    const submitButton = document.getElementById("saveStudentButton");

    verifyAdminSession();

    form.addEventListener("submit", async function (event) {
        event.preventDefault();

        const student = {
            name: document.getElementById("studentName").value.trim(),
            email: document.getElementById("studentEmail").value.trim(),
            roll_no: document.getElementById("rollNumber").value.trim(),
            course: document.getElementById("studentCourse").value,
            semester: Number(document.getElementById("studentSemester").value),
            password: document.getElementById("studentPassword").value
        };

        if (
            !student.name ||
            !student.email ||
            !student.roll_no ||
            !student.course ||
            !student.semester ||
            student.password.length < 8
        ) {
            showMessage("Please fill in all fields correctly. Password must be at least 8 characters.", false);
            return;
        }

        submitButton.disabled = true;
        submitButton.textContent = "Adding Student...";
        message.textContent = "";

        try {
            const response = await fetch(`${API_URL}/admin/add-student.php`, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(student)
            });

            const data = await response.json();

            if (response.status === 401) {
                window.location.href = "admin-login.html";
                return;
            }

            if (!response.ok || !data.success) {
                throw new Error(data.message || "Could not add student.");
            }

            showMessage("Student added successfully!", true);
            form.reset();

            setTimeout(function () {
                window.location.href = "admin-students.html";
            }, 1200);

        } catch (error) {
            console.error("Add Student Error:", error);
            showMessage(error.message || "Unable to connect to the backend.", false);

        } finally {
            submitButton.disabled = false;
            submitButton.textContent = "Add Student";
        }
    });

    async function verifyAdminSession() {
        try {
            const response = await fetch(`${API_URL}/admin/check_session.php`, {
                credentials: "include"
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                window.location.href = "admin-login.html";
                return;
            }

            document.getElementById("adminName").textContent = data.admin.name;
            document.getElementById("adminEmail").textContent = data.admin.email;

        } catch (error) {
            console.error("Session Check Error:", error);
            showMessage("Unable to verify admin session. Check XAMPP.", false);
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
            showMessage("Unable to log out. Please try again.", false);
        }
    }

    function showMessage(text, success) {
        message.textContent = text;
        message.style.color = success ? "#15803d" : "#dc2626";
    }

    document.getElementById("logoutButton").addEventListener("click", logoutAdmin);

    document.getElementById("facultyLink").addEventListener("click", function (event) {
        event.preventDefault();
        alert("Faculty Management will be implemented later.");
    });
});