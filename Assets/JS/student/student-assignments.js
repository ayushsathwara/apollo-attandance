
const assignmentsContainer = document.getElementById("assignmentsContainer");

const ASSIGNMENTS_URL = "http://localhost/apollo-backend/student/assignments.php";
const SUBMIT_URL = "http://localhost/apollo-backend/student/submit_assignment.php";
const DOWNLOAD_ASSIGNMENT_URL = "http://localhost/apollo-backend/student/download_assignment.php";
const DOWNLOAD_SUBMISSION_URL = "http://localhost/apollo-backend/student/download_submission.php";

let allAssignments = [];


// Escape text before inserting database values into HTML
function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    })[char]);
}


// Parse SQL date without timezone shifting
function parseDate(dateString) {
    if (!dateString) return null;

    const parts = dateString.split("-").map(Number);

    if (parts.length !== 3 || parts.some(Number.isNaN)) {
        return null;
    }

    return new Date(parts[0], parts[1] - 1, parts[2]);
}


function formatDate(dateString) {
    const date = parseDate(dateString);

    if (!date || Number.isNaN(date.getTime())) {
        return "Not available";
    }

    return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
}


function formatDate(dateString) {
    if (!dateString) {
        return "Not available";
    }

    // Handle MySQL date: YYYY-MM-DD HH:MM:SS
    const datePart = dateString.split(" ")[0];
    const parts = datePart.split("-").map(Number);

    if (parts.length !== 3 || parts.some(Number.isNaN)) {
        return "Not available";
    }

    const date = new Date(parts[0], parts[1] - 1, parts[2]);

    return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
}

function formatDateTime(dateString) {
    if (!dateString) {
        return "Not available";
    }

    // Handle MySQL datetime format
    const date = new Date(dateString.replace(" ", "T"));

    if (isNaN(date.getTime())) {
        return "Not available";
    }

    return date.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
}


function getDeadlineMessage(dueDate) {
    const due = parseDate(dueDate);

    if (!due) return "";

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    due.setHours(0, 0, 0, 0);

    const difference = Math.round((due - today) / 86400000);

    if (difference === 0) return "Due today";
    if (difference === 1) return "Due tomorrow";
    if (difference === 2) return "Due in 2 days";

    return "";
}


// Create frontend controls
function createControls() {
    assignmentsContainer.innerHTML = `
        <div class="assignment-dashboard">

            <div class="assignment-summary">
                <div class="summary-card">
                    <span>Total Assignments</span>
                    <strong id="totalCount">0</strong>
                </div>

                <div class="summary-card">
                    <span>Submitted</span>
                    <strong id="submittedCount">0</strong>
                </div>

                <div class="summary-card">
                    <span>Pending</span>
                    <strong id="pendingCount">0</strong>
                </div>

                <div class="summary-card">
                    <span>Overdue</span>
                    <strong id="overdueCount">0</strong>
                </div>
            </div>

            <div class="assignment-filters">

                <input
                    type="search"
                    id="assignmentSearch"
                    placeholder="Search assignment title..."
                >

                <select id="subjectFilter">
                    <option value="All">All Subjects</option>
                </select>

                <select id="statusFilter">
                    <option value="All">All Status</option>
                    <option value="Pending">Pending</option>
                    <option value="Submitted">Submitted</option>
                    <option value="Overdue">Overdue</option>
                </select>

            </div>

            <div id="assignmentList"></div>

        </div>
    `;

    document.getElementById("assignmentSearch")
        .addEventListener("input", renderAssignments);

    document.getElementById("subjectFilter")
        .addEventListener("change", renderAssignments);

    document.getElementById("statusFilter")
        .addEventListener("change", renderAssignments);
}


// Update summary cards
function updateSummary() {
    document.getElementById("totalCount").textContent =
        allAssignments.length;

    document.getElementById("submittedCount").textContent =
        allAssignments.filter(a => a.status === "Submitted").length;

    document.getElementById("pendingCount").textContent =
        allAssignments.filter(a => a.status === "Pending").length;

    document.getElementById("overdueCount").textContent =
        allAssignments.filter(a => a.status === "Overdue").length;
}


// Add available subjects to dropdown
function updateSubjectFilter() {
    const subjectFilter = document.getElementById("subjectFilter");

    const subjects = [...new Set(
        allAssignments.map(a => a.subject).filter(Boolean)
    )].sort();

    subjectFilter.innerHTML =
        `<option value="All">All Subjects</option>` +
        subjects.map(subject => `
            <option value="${escapeHTML(subject)}">
                ${escapeHTML(subject)}
            </option>
        `).join("");
}


// Load assignments from backend
async function loadAssignments() {
    assignmentsContainer.innerHTML = `
        <div class="loading">Loading assignments...</div>
    `;

    try {
        const response = await fetch(ASSIGNMENTS_URL, {
            credentials: "include"
        });

        const data = await response.json();

        if (!data || data.status !== "success") {
            assignmentsContainer.innerHTML = `
                <div class="no-assignments">
                    ${escapeHTML(data?.message || "Unable to load assignments.")}
                </div>
            `;
            return;
        }

        allAssignments = Array.isArray(data.assignments)
            ? data.assignments
            : [];

        if (allAssignments.length === 0) {
            assignmentsContainer.innerHTML = `
                <div class="no-assignments">
                    No assignments available.
                </div>
            `;
            return;
        }

        createControls();
        updateSummary();
        updateSubjectFilter();
        renderAssignments();

    } catch (error) {
        console.error("Loading Error:", error);

        assignmentsContainer.innerHTML = `
            <div class="no-assignments">
                Server error. Please try again.
            </div>
        `;
    }
}


// Filter, search and sort assignments
function renderAssignments() {
    const search = document.getElementById("assignmentSearch")
        .value.trim().toLowerCase();

    const subject = document.getElementById("subjectFilter").value;
    const status = document.getElementById("statusFilter").value;

    let filtered = allAssignments.filter(assignment => {
        const matchesSearch =
            (assignment.title || "").toLowerCase().includes(search);

        const matchesSubject =
            subject === "All" || assignment.subject === subject;

        const matchesStatus =
            status === "All" || assignment.status === status;

        return matchesSearch && matchesSubject && matchesStatus;
    });

    // Newest assignments first
    filtered.sort((a, b) => {
        const dateA = new Date(a.created_at || 0).getTime();
        const dateB = new Date(b.created_at || 0).getTime();

        return dateB - dateA;
    });

    const list = document.getElementById("assignmentList");

    if (filtered.length === 0) {
        list.innerHTML = `
            <div class="no-assignments">
                No assignments match your selected filters.
            </div>
        `;
        return;
    }

    list.innerHTML = filtered.map(createAssignmentCard).join("");
}


// Build each assignment card
function createAssignmentCard(assignment) {
    const id = Number(assignment.id);
    const status = assignment.status || "Pending";

    const deadlineMessage =
        status === "Pending"
            ? getDeadlineMessage(assignment.due_date)
            : "";

    let actionHTML = "";

    if (assignment.assignment_file_name) {
        actionHTML += `
            <button
                type="button"
                class="submit-btn"
                onclick="downloadAssignment(${id})"
            >
                Download Assignment
            </button>
        `;
    }

    if (status === "Pending") {
        actionHTML += `
            <div class="submission-box">

                <label for="submissionFile-${id}">
                    Upload Your Assignment
                </label>

                <input
                    type="file"
                    id="submissionFile-${id}"
                    accept=".pdf,.doc,.docx,.zip"
                >

                <button
                    type="button"
                    class="submit-btn"
                    onclick="submitAssignment(${id})"
                >
                    Upload Assignment
                </button>

            </div>
        `;
    }

    else if (status === "Submitted") {
        actionHTML += `
            <div class="submission-details">

                <p>
                    <strong>Submitted File:</strong>
                    ${escapeHTML(assignment.submission_file_name || "Not available")}
                </p>

                <p>
                    <strong>Submitted On:</strong>
                    ${escapeHTML(formatDateTime(assignment.submitted_at))}
                </p>

                ${assignment.submission_id
                ? `
                            <button
                                type="button"
                                class="submit-btn"
                                onclick="downloadSubmission(${Number(assignment.submission_id)})"
                            >
                                Download My Submission
                            </button>
                        `
                : ""
            }

            </div>
        `;
    }

    else if (status === "Overdue") {
        actionHTML += `
            <p class="overdue-message">
                Submission deadline has passed. This assignment can no longer
                be submitted online. Please contact your subject faculty
                for further guidance.
            </p>
        `;
    }

    return `
        <div class="assignment-card">

            <div class="assignment-top">

                <div>
                    <h3 class="assignment-title">
                        ${escapeHTML(assignment.title)}
                    </h3>

                    <p class="assignment-subject">
                        ${escapeHTML(assignment.subject)}
                    </p>
                </div>

                <span class="status ${escapeHTML(status.toLowerCase())}">
                    ${escapeHTML(status)}
                </span>

            </div>

            <div class="assignment-info">

                <div class="info-box">
                    <span>Faculty</span>
                    <strong>${escapeHTML(assignment.faculty_name)}</strong>
                </div>

                <div class="info-box">
                    <span>Due Date</span>
                    <strong>${escapeHTML(formatDate(assignment.due_date))}</strong>
                </div>

                <div class="info-box">
                    <span>Uploaded On</span>
                    <strong>${escapeHTML(formatDate(assignment.created_at))}</strong>
                </div>

            </div>

            ${deadlineMessage
            ? `<p class="deadline-warning">${escapeHTML(deadlineMessage)}</p>`
            : ""
        }

            <p class="assignment-description">
                ${escapeHTML(assignment.description || "No description provided.")}
            </p>

            <div class="assignment-action">
                ${actionHTML}
            </div>

        </div>
    `;
}


// Download faculty assignment
function downloadAssignment(assignmentId) {
    window.location.href =
        `${DOWNLOAD_ASSIGNMENT_URL}?id=${encodeURIComponent(assignmentId)}`;
}


// Download student's own submission
function downloadSubmission(submissionId) {
    window.location.href =
        `${DOWNLOAD_SUBMISSION_URL}?id=${encodeURIComponent(submissionId)}`;
}


// Submit assignment
async function submitAssignment(assignmentId) {
    const fileInput = document.getElementById(
        `submissionFile-${assignmentId}`
    );

    if (!fileInput || !fileInput.files[0]) {
        alert("Please select your assignment file.");
        return;
    }

    const file = fileInput.files[0];

    const allowedExtensions = ["pdf", "doc", "docx", "zip"];
    const extension = file.name.split(".").pop().toLowerCase();

    if (!allowedExtensions.includes(extension)) {
        alert("Only PDF, DOC, DOCX and ZIP files are allowed.");
        return;
    }

    const maxSize = 10 * 1024 * 1024;

    if (file.size > maxSize) {
        alert("File size must be less than 10 MB.");
        return;
    }

    if (!confirm("Are you sure you want to submit this assignment?")) {
        return;
    }

    const formData = new FormData();

    formData.append("assignment_id", assignmentId);
    formData.append("submission_file", file);

    try {
        const response = await fetch(SUBMIT_URL, {
            method: "POST",
            credentials: "include",
            body: formData
        });

        const responseText = await response.text();
        console.log("Submission Response:", responseText);

        let data;

        try {
            data = JSON.parse(responseText);
        } catch {
            throw new Error("Invalid server response.");
        }

        if (data.status === "success") {
            alert("Assignment submitted successfully!");
            await loadAssignments();
        } else {
            alert(data.message || "Unable to submit assignment.");
        }

    } catch (error) {
        console.error("Submission Error:", error);
        alert(error.message || "Server error.");
    }
}


// Start
loadAssignments();
