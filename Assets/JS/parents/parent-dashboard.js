const API_URL = "http://localhost/apollo-backend";
const LOGIN_URL = "http://localhost/apollo-attandance/index.html";

// Common API request
async function fetchParentData(endpoint) {
    const response = await fetch(`${API_URL}${endpoint}`, {
        method: "GET",
        credentials: "include"
    });

    if (response.status === 401) {
        alert("Please log in as a parent.");
        window.location.href = LOGIN_URL;
        throw new Error("Parent session expired.");
    }

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Unable to load data.");
    }

    return data;
}


// ========================================
// 1. PARENT PROFILE
// ========================================

async function loadParentProfile() {
    try {
        const data = await fetchParentData("/parent/profile.php");

        if (data.status !== "success") {
            throw new Error(data.message || "Unable to load profile.");
        }

        const profile = data.profile;

        document.getElementById("welcomeName").textContent =
            `Welcome, ${profile.parent_name}!`;

        document.getElementById("studentName").textContent =
            profile.student_name;

        document.getElementById("rollNo").textContent =
            profile.roll_no;

        document.getElementById("course").textContent =
            profile.course;

        document.getElementById("semester").textContent =
            profile.semester;

        // Parent profile photo
        const parentInitial = document.getElementById("parentInitial");
        const parentPhoto = document.getElementById("parentPhoto");

        const initial = (profile.parent_name || "P")
            .charAt(0).toUpperCase();

        parentInitial.textContent = initial;

        function showParentInitial() {
            parentPhoto.hidden = true;
            parentInitial.style.display = "flex";
        }

        if (profile.profile_photo) {

            const photoPath = profile.profile_photo.replace(/\\/g, "/");

            const photoURL = photoPath.startsWith("http")
                ? photoPath
                : "http://localhost/apollo-backend/" + photoPath.replace(/^\/+/, "");

            parentPhoto.onload = function () {
                parentPhoto.hidden = false;
                parentInitial.style.display = "none";
            };

            parentPhoto.onerror = showParentInitial;

            parentPhoto.src = photoURL + "?t=" + Date.now();

        } else {
            showParentInitial();
        }

    } catch (error) {
        console.error("Parent profile error:", error);

        document.getElementById("studentName").textContent =
            "Unable to load student details";
    }
}


// ========================================
// 2. ATTENDANCE SUMMARY
// ========================================

async function loadAttendanceOverview() {
    const message = document.getElementById("attendanceMessage");

    try {
        const data = await fetchParentData("/parent/attendance-overview.php");

        if (data.status !== "success") {
            throw new Error(data.message || "Could not load attendance.");
        }

        const summary = data.summary;

        const percentage = Math.max(
            0,
            Math.min(100, Number(summary.percentage) || 0)
        );

        document.getElementById("overallPercentage").textContent =
            `${percentage}%`;

        const progressBar =
            document.getElementById("overallProgressBar");

        const attendanceLabel =
            document.getElementById("overallAttendanceLabel");

        progressBar.style.width = `${percentage}%`;

        if (percentage >= 75) {
            progressBar.style.background = "#16a36a";
            attendanceLabel.textContent = "Good attendance";
            attendanceLabel.style.color = "#16834f";
        } else {
            progressBar.style.background = "#dc5353";
            attendanceLabel.textContent =
                "Below 75% — Needs improvement";
            attendanceLabel.style.color = "#c0392b";
        }

        document.getElementById("totalClasses").textContent =
            summary.total_classes;

        document.getElementById("presentClasses").textContent =
            summary.present;

        document.getElementById("absentClasses").textContent =
            summary.absent;

        document.getElementById("attendanceWarning").hidden =
            !summary.warning;

        message.textContent = "Attendance summary updated successfully.";

    } catch (error) {
        console.error("Attendance overview error:", error);
        message.textContent = error.message;
    }
}


// ========================================
// 3. ASSIGNMENT SUMMARY
// ========================================

async function loadParentAssignments() {
    const message = document.getElementById("assignmentsMessage");

    try {
        const data = await fetchParentData("/parent/assignments.php");

        if (data.status !== "success") {
            throw new Error(data.message || "Unable to load assignments.");
        }

        const assignments = data.assignments || [];

        const pending = assignments.filter(
            a => a.status === "Pending"
        ).length;

        const submitted = assignments.filter(
            a => a.status === "Submitted"
        ).length;

        const overdue = assignments.filter(
            a => a.status === "Overdue"
        ).length;

        document.getElementById("assignmentTotal").textContent =
            assignments.length;

        document.getElementById("assignmentPending").textContent =
            pending;

        document.getElementById("assignmentSubmitted").textContent =
            submitted;

        document.getElementById("assignmentOverdue").textContent =
            overdue;

        message.textContent = assignments.length === 0
            ? "No assignments found for your child yet."
            : "Assignment summary updated successfully.";

    } catch (error) {
        console.error("Parent assignments error:", error);
        message.textContent = error.message;
    }
}


// ========================================
// 4. LATEST NOTICES (MAXIMUM 2)
// ========================================

async function loadParentNotices() {
    const message = document.getElementById("noticesMessage");
    const noticesList = document.getElementById("noticesList");

    noticesList.replaceChildren();

    try {
        const data = await fetchParentData("/parent/notices.php");

        if (!data.success) {
            throw new Error(data.message || "Failed to load notices.");
        }

        if (!Array.isArray(data.notices) || data.notices.length === 0) {
            message.textContent = "No notices available right now.";
            return;
        }

        message.textContent = "";

        // Display only the first two notices.
        data.notices.slice(0, 2).forEach(notice => {

            const card = document.createElement("article");
            card.className = "notice-card";

            const header = document.createElement("div");
            header.className = "notice-card-header";

            const title = document.createElement("h3");
            title.textContent = notice.title || "Untitled Notice";

            const badge = document.createElement("span");
            badge.className = "notice-badge";
            badge.textContent = "Announcement";

            header.append(title, badge);

            const content = document.createElement("p");
            content.className = "notice-content";
            content.textContent =
                notice.message || "No description available.";

            const footer = document.createElement("div");
            footer.className = "notice-footer";

            const postedBy = document.createElement("span");
            postedBy.className = "notice-posted-by";
            postedBy.textContent =
                "Posted by: " + (notice.posted_by || "College");

            const date = document.createElement("small");
            date.className = "notice-date";

            if (notice.created_at) {
                const formattedDate = new Date(
                    notice.created_at.replace(" ", "T")
                );

                date.textContent = !isNaN(formattedDate.getTime())
                    ? formattedDate.toLocaleString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric"
                    })
                    : notice.created_at;
            } else {
                date.textContent = "Date unavailable";
            }

            footer.append(postedBy, date);
            card.append(header, content, footer);

            noticesList.appendChild(card);
        });

    } catch (error) {
        console.error("Parent notices error:", error);
        message.textContent = error.message;
    }
}


// ========================================
// 5. LOGOUT
// ========================================

document.getElementById("logoutBtn").addEventListener("click", async function () {

    try {
        const response = await fetch(`${API_URL}/auth/logout.php`, {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: new URLSearchParams({
                role: "parent"
            })
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


// ========================================
// LOAD DASHBOARD DATA
// ========================================

loadParentProfile();
loadAttendanceOverview();
loadParentAssignments();
loadParentNotices();