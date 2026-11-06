
const API_URL = "http://localhost/apollo-backend";
const LOGIN_URL = "http://localhost/apollo-attandance/index.html";

async function loadAttendanceData() {
    try {
        const response = await fetch(
            `${API_URL}/parent/attendance-overview.php`,
            {
                method: "GET",
                credentials: "include"
            }
        );

        if (response.status === 401) {
            alert("Please log in as a parent.");
            window.location.href = LOGIN_URL;
            return;
        }

        const data = await response.json();

        console.log("Parent Attendance API:", data);

        if (!response.ok || data.status !== "success") {
            throw new Error(data.message || "Unable to load attendance.");
        }

        // Correct API structure
        const summary = data.summary;

        const total = Number(summary.total_classes || 0);
        const present = Number(summary.present || 0);
        const absent = Number(summary.absent || 0);
        const percentage = Number(summary.percentage || 0);

        // Overall attendance
        document.getElementById("overallPercentage").textContent =
            percentage.toFixed(2) + "%";

        document.getElementById("circlePercentage").textContent =
            percentage.toFixed(2) + "%";

        document.getElementById("overallAttendanceLabel").textContent =
            percentage.toFixed(2) + "%";

        // Class counts
        document.getElementById("totalClasses").textContent = total;
        document.getElementById("presentClasses").textContent = present;
        document.getElementById("absentClasses").textContent = absent;

        // Progress bar
        const safePercentage = Math.min(100, Math.max(0, percentage));

        document.getElementById("overallProgressBar").style.width =
            safePercentage + "%";

        document.querySelector(".attendance-circle").style.background =
            `conic-gradient(#ffffff ${safePercentage}%, rgba(255,255,255,.25) 0%)`;

        // Attendance message
        document.getElementById("attendanceMessage").textContent =
            total === 0
                ? "No attendance records available yet."
                : percentage >= 75
                    ? "Great! Your child's attendance is satisfactory."
                    : "Attendance is below the recommended 75%.";

        document.getElementById("attendanceWarning").textContent =
            total === 0
                ? "Attendance details will appear when classes are recorded."
                : percentage >= 75
                    ? "Your child's attendance is meeting the recommended 75% requirement."
                    : "Please ensure your child attends classes regularly to maintain at least 75% attendance.";

        // Subject-wise attendance
        renderSubjectAttendance(data.subjects || []);

        // Recent history
        renderAttendanceHistory(data.history || []);

    } catch (error) {
        console.error("Attendance error:", error);

        document.getElementById("attendanceMessage").textContent =
            "Unable to load attendance data.";

        document.getElementById("attendanceWarning").textContent =
            error.message;

        document.getElementById("subjectAttendanceBody").innerHTML =
            `<tr><td colspan="5">Unable to load subject attendance.</td></tr>`;

        document.getElementById("attendanceHistoryBody").innerHTML =
            `<tr><td colspan="3">Unable to load attendance history.</td></tr>`;
    }
}


// Subject-wise attendance
function renderSubjectAttendance(subjects) {

    const tbody = document.getElementById("subjectAttendanceBody");

    if (!subjects.length) {
        tbody.innerHTML =
            `<tr><td colspan="5">No subject attendance available.</td></tr>`;
        return;
    }

    tbody.innerHTML = subjects.map(subject => {

        const total = Number(subject.total_classes || 0);
        const present = Number(subject.present || 0);
        const absent = Number(subject.absent || 0);
        const percentage = Number(subject.percentage || 0);

        return `
            <tr>
                <td>${subject.subject || "N/A"}</td>
                <td>${total}</td>
                <td>${present}</td>
                <td>${absent}</td>
                <td><strong>${percentage.toFixed(2)}%</strong></td>
            </tr>
        `;

    }).join("");
}


// Recent attendance history
function renderAttendanceHistory(history) {

    const tbody = document.getElementById("attendanceHistoryBody");

    if (!history.length) {
        tbody.innerHTML =
            `<tr><td colspan="3">No recent attendance records found.</td></tr>`;
        return;
    }

    tbody.innerHTML = history.map(record => {

        const status = String(record.status || "N/A");
        const statusClass =
            status.toLowerCase() === "present"
                ? "status-present"
                : status.toLowerCase() === "absent"
                    ? "status-absent"
                    : "";

        return `
            <tr>
                <td>${record.attendance_date || "N/A"}</td>
                <td>${record.subject || "N/A"}</td>
                <td>
                    <span class="${statusClass}">${status}</span>
                </td>
            </tr>
        `;

    }).join("");
}


// Logout
document.getElementById("logoutBtn").addEventListener("click", async function () {

    try {
        const response = await fetch(`${API_URL}/auth/logout.php`, {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: new URLSearchParams({ role: "parent" })
        });

        if (!response.ok) {
            alert("Unable to log out. Please try again.");
            return;
        }

        window.location.href = LOGIN_URL;

    } catch (error) {
        console.error("Logout error:", error);
        alert("Unable to connect to the server.");
    }
});


// Load attendance
loadAttendanceData();
