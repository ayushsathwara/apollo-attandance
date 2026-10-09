
const API_URL = "http://localhost/apollo-backend";

document.addEventListener("DOMContentLoaded", function () {
    loadAdminDashboard();

    document.getElementById("logoutButton").addEventListener("click", logoutAdmin);

    document.getElementById("studentsLink").addEventListener("click", function (event) {
        event.preventDefault();
        window.location.href = "admin-students.html";
    });

    document.getElementById("facultyLink").addEventListener("click", function (event) {
        event.preventDefault();
        alert("Faculty Management will be implemented next.");
    });

    document.getElementById("studentActionButton").addEventListener("click", function () {
        window.location.href = "admin-students.html";
    });

    document.getElementById("facultyActionButton").addEventListener("click", function () {
        alert("Bro, we'll build Faculty Management next.");
    });

    document.getElementById("feedbackActionButton").addEventListener("click", function () {
        alert("Bro, we'll build Student Feedback next.");
    });
});

async function loadAdminDashboard() {
    const message = document.getElementById("dashboardMessage");

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

        document.getElementById("adminName").textContent = data.admin.name;
        document.getElementById("adminEmail").textContent = data.admin.email;

        await loadSupportStatistics();

    } catch (error) {
        console.error("Dashboard Error:", error);
        message.textContent =
            "Unable to load dashboard. Check that Apache and MySQL are running.";
    }
}

async function loadSupportStatistics() {
    const response = await fetch(
        `${API_URL}/admin/support-requests.php`,
        { credentials: "include" }
    );

    if (response.status === 401) {
        window.location.href = "admin-login.html";
        return;
    }

    const data = await response.json();

    if (!response.ok || !data.success || !Array.isArray(data.requests)) {
        throw new Error("Could not load support requests.");
    }

    const requests = data.requests;

    document.getElementById("supportCount").textContent = requests.length;

    document.getElementById("openCount").textContent =
        requests.filter(request => request.status === "Open").length;
}

async function logoutAdmin() {
    try {
        const response = await fetch(`${API_URL}/admin/logout.php`, {
            method: "POST",
            credentials: "include"
        });

        if (!response.ok) {
            throw new Error("Logout request failed.");
        }

        window.location.href = "admin-login.html";

    } catch (error) {
        console.error("Logout Error:", error);
        alert("Could not log out. Please check your server and try again.");
    }
}

async function loadDashboardStats() {
    try {
        const response = await fetch(
            "http://localhost/apollo-backend/admin/dashboard-stats.php",
            {
                credentials: "include"
            }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(data.message || "Failed to load stats");
        }

        document.getElementById("studentCount").textContent =
            data.total_students;

        document.getElementById("facultyCount").textContent =
            data.total_faculty;

    } catch (error) {
        console.error("Dashboard stats error:", error);
    }
}

loadDashboardStats();