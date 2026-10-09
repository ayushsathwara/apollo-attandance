const API_URL = "http://localhost/apollo-backend";

async function loadParentProfile() {
    try {
        const response = await fetch(
            `${API_URL}/parent/profile.php`,
            {
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

document.getElementById("logoutBtn").addEventListener("click", async function () {
    try {
        const response = await fetch(
            `${API_URL}/auth/logout.php`,
            {
                method: "POST",
                credentials: "include"
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
            `${API_URL}/parent/attendance-overview.php`,
            {
                method: "GET",
                credentials: "include"
            }
        );

        const data = await response.json();

        if (!response.ok || data.status !== "success") {
            throw new Error(data.message || "Could not load attendance.");
        }

        const summary = data.summary;

        document.getElementById("overallPercentage").textContent =
            `${summary.percentage}%`;

        document.getElementById("totalClasses").textContent =
            summary.total_classes;

        document.getElementById("presentClasses").textContent =
            summary.present;

        document.getElementById("absentClasses").textContent =
            summary.absent;

        document.getElementById("attendanceWarning").hidden =
            !summary.warning;

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

                [
                    subject.subject,
                    subject.total_classes,
                    subject.present,
                    subject.absent,
                    `${subject.percentage}%`
                ].forEach(value => {
                    const cell = document.createElement("td");
                    cell.textContent = value;
                    row.appendChild(cell);
                });

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
            `${API_URL}/parent/assignments.php`,
            {
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