const API_URL = "http://localhost/apollo-backend";

async function loadParentProfile() {
    try {
        const response = await fetch(
            `${API_URL}/parent/profile.php`, {
                method: "GET",
                credentials: "include"
            }
        );

        if (response.status === 401) {
            alert("Please log in as a parent.");

            window.location.href =
                "http://localhost/apollo-attandance/index.html";

            return;
        }

        const data = await response.json();

        if (!response.ok || data.status !== "success") {
            throw new Error(data.message || "Unable to load profile.");
        }

        const profile = data.profile;
        console.log("Parent profile data:", data.profile);
        console.log("Child name:", data.profile.student_name);

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

        document.querySelector(".parent-avatar").textContent =
            profile.parent_name.charAt(0).toUpperCase();

    } catch (error) {
        console.error("Parent profile error:", error);

        document.getElementById("studentName").textContent =
            "Unable to load student details";

        document.getElementById("attendanceMessage").textContent =
            error.message;
    }
}

document.getElementById("logoutBtn").addEventListener("click", async function() {
    try {
        const response = await fetch(
            `${API_URL}/auth/logout.php`, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                body: new URLSearchParams({
                    role: "parent"
                })
            }
        );

        if (!response.ok) {
            alert("Unable to log out. Please try again.");
            return;
        }

        window.location.href =
            "http://localhost/apollo-attandance/index.html";

    } catch (error) {
        console.error("Logout error:", error);
        alert("Unable to connect to the server.");
    }
});

loadParentProfile();


async function loadAttendanceOverview() {
    const message = document.getElementById("attendanceMessage");

    try {
        const response = await fetch(
            `${API_URL}/parent/attendance-overview.php`, {
                method: "GET",
                credentials: "include"
            }
        );

        const data = await response.json();

        if (!response.ok || data.status !== "success") {
            throw new Error(data.message || "Could not load attendance.");
        }

        const summary = data.summary;

        const percentage = Math.max(0, Math.min(100, Number(summary.percentage) || 0));

        document.getElementById("overallPercentage").textContent =
            `${percentage}%`;

        const progressBar = document.getElementById("overallProgressBar");
        const attendanceLabel = document.getElementById("overallAttendanceLabel");

        progressBar.style.width = `${percentage}%`;

        if (percentage >= 75) {
            progressBar.style.background = "#16a36a";
            attendanceLabel.textContent = "Good attendance";
            attendanceLabel.style.color = "#16834f";
        } else {
            progressBar.style.background = "#dc5353";
            attendanceLabel.textContent = "Below 75% — Needs improvement";
            attendanceLabel.style.color = "#c0392b";
        }

        document.getElementById("totalClasses").textContent =
            summary.total_classes;

        document.getElementById("presentClasses").textContent =
            summary.present;

        document.getElementById("absentClasses").textContent =
            summary.absent;

        document.getElementById("attendanceWarning").hidden = !summary.warning;


        // Subject-wise attendance
        const subjectBody =
            document.getElementById("subjectAttendanceBody");

        subjectBody.replaceChildren();

        if (data.subjects.length === 0) {
            subjectBody.innerHTML =
                '<tr><td colspan="5">No attendance records yet.</td></tr>';
        } else {
            data.subjects.forEach(subject => {

                const row = document.createElement("tr");

                const percentage = Math.max(
                    0,
                    Math.min(100, Number(subject.percentage) || 0)
                );

                // Subject name
                const subjectCell = document.createElement("td");
                subjectCell.textContent = subject.subject;

                // Total classes
                const totalCell = document.createElement("td");
                totalCell.textContent = subject.total_classes;

                // Present classes
                const presentCell = document.createElement("td");
                presentCell.textContent = subject.present;

                // Absent classes
                const absentCell = document.createElement("td");
                absentCell.textContent = subject.absent;

                // Percentage and progress bar
                const percentageCell = document.createElement("td");

                const percentageText = document.createElement("strong");
                percentageText.textContent = `${percentage}%`;

                percentageText.style.color =
                    percentage >= 75 ? "#16834f" : "#c0392b";

                const progressTrack = document.createElement("div");
                progressTrack.className = "subject-progress-track";

                const progressFill = document.createElement("div");
                progressFill.className = "subject-progress-fill";

                progressFill.style.width = `${percentage}%`;
                progressFill.style.background =
                    percentage >= 75 ? "#16a36a" : "#dc5353";

                progressTrack.appendChild(progressFill);

                percentageCell.append(
                    percentageText,
                    progressTrack
                );

                row.append(
                    subjectCell,
                    totalCell,
                    presentCell,
                    absentCell,
                    percentageCell
                );

                subjectBody.appendChild(row);
            });
        }


        // Recent attendance history
        const historyBody =
            document.getElementById("attendanceHistoryBody");

        historyBody.replaceChildren();

        if (data.history.length === 0) {
            historyBody.innerHTML =
                '<tr><td colspan="3">No attendance history yet.</td></tr>';
        } else {
            data.history.forEach(record => {
                const row = document.createElement("tr");

                [
                    record.attendance_date,
                    record.subject,
                    record.status
                ].forEach(value => {
                    const cell = document.createElement("td");
                    cell.textContent = value;
                    row.appendChild(cell);
                });

                historyBody.appendChild(row);
            });
        }

        message.textContent = "Attendance data updated successfully.";

    } catch (error) {
        console.error("Attendance overview error:", error);
        message.textContent = error.message;
    }
}

loadAttendanceOverview();

async function loadParentAssignments() {
    const message = document.getElementById("assignmentsMessage");
    const list = document.getElementById("assignmentsList");

    try {
        const response = await fetch(
            `${API_URL}/parent/assignments.php`, {
                method: "GET",
                credentials: "include"
            }
        );

        const data = await response.json();

        if (!response.ok || data.status !== "success") {
            throw new Error(data.message || "Unable to load assignments.");
        }

        const assignments = data.assignments || [];

        const pending = assignments.filter(a => a.status === "Pending").length;
        const submitted = assignments.filter(a => a.status === "Submitted").length;
        const overdue = assignments.filter(a => a.status === "Overdue").length;

        document.getElementById("assignmentTotal").textContent = assignments.length;
        document.getElementById("assignmentPending").textContent = pending;
        document.getElementById("assignmentSubmitted").textContent = submitted;
        document.getElementById("assignmentOverdue").textContent = overdue;

        list.replaceChildren();

        if (assignments.length === 0) {
            message.textContent = "No assignments found for your child yet.";
            return;
        }

        assignments.forEach(assignment => {
            const card = document.createElement("article");
            card.className = "assignment-card";

            const title = document.createElement("h3");
            title.textContent = assignment.title;

            const subject = document.createElement("p");
            subject.textContent = `Subject: ${assignment.subject}`;

            const dueDate = document.createElement("p");
            dueDate.textContent = `Due date: ${assignment.due_date}`;

            const status = document.createElement("span");
            status.className = `assignment-status ${assignment.status.toLowerCase()}`;
            status.textContent = assignment.status;

            card.append(title, subject, dueDate);

            if (assignment.description) {
                const description = document.createElement("p");
                description.textContent = assignment.description;
                card.appendChild(description);
            }

            card.appendChild(status);

            if (assignment.assignment_file_path) {
                const fileLink = document.createElement("a");
                fileLink.href = `http://localhost/apollo-backend/${assignment.assignment_file_path.replace(/^\/+/, "")}`;
                fileLink.textContent = "📄 View Assignment File";
                fileLink.className = "view-assignment-btn";
                fileLink.target = "_blank";
                fileLink.rel = "noopener noreferrer";
                card.appendChild(fileLink);
            }

            list.appendChild(card);
        });

        message.textContent = "Assignments loaded successfully.";

    } catch (error) {
        console.error("Parent assignments error:", error);
        message.textContent = error.message;
        list.replaceChildren();
    }
}

loadParentAssignments();
// ========================================
// PARENT DASHBOARD - NOTICES & ANNOUNCEMENTS
// ========================================


async function loadParentNotices() {
    const message = document.getElementById("noticesMessage");
    const noticesList = document.getElementById("noticesList");

    if (!message || !noticesList) return;

    message.textContent = "Loading notices...";
    noticesList.replaceChildren();

    try {
        const response = await fetch(
            `${API_URL}/parent/notices.php`, {
                method: "GET",
                credentials: "include"
            }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(data.message || "Failed to load notices.");
        }

        if (!Array.isArray(data.notices) || data.notices.length === 0) {
            message.textContent = "No notices available right now.";
            return;
        }

        message.textContent = "";

        data.notices.forEach(function(notice) {

            const card = document.createElement("article");
            card.className = "notice-card";

            // Notice header
            const header = document.createElement("div");
            header.className = "notice-card-header";

            const title = document.createElement("h3");
            title.textContent = notice.title || "Untitled Notice";

            const badge = document.createElement("span");
            badge.className = "notice-badge";
            badge.textContent = "Announcement";

            header.append(title, badge);

            // Notice message
            const content = document.createElement("p");
            content.className = "notice-content";
            content.textContent = notice.message || "No description available.";

            // Notice footer
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

                date.textContent = !isNaN(formattedDate.getTime()) ?
                    formattedDate.toLocaleString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit"
                    }) :
                    notice.created_at;
            } else {
                date.textContent = "Date unavailable";
            }

            footer.append(postedBy, date);

            card.append(header, content, footer);

            noticesList.appendChild(card);
        });

    } catch (error) {
        console.error("Parent Notices Error:", error);
        message.textContent =
            "Unable to load notices. Please try again later.";
    }
}

loadParentNotices();

loadParentNotices();