
const subjectSelect = document.getElementById("subjectSelect");
const assignmentSelect = document.getElementById("assignmentSelect");
const submissionsBody = document.getElementById("submissionsBody");

const totalStudents = document.getElementById("totalStudents");
const submittedStudents = document.getElementById("submittedStudents");
const pendingStudents = document.getElementById("pendingStudents");
const overdueStudents = document.getElementById("overdueStudents");

const studentSearch = document.getElementById("studentSearch");
const statusFilter = document.getElementById("statusFilter");

let allAssignments = [];
let allStudents = [];


/* ================================
   LOAD FACULTY ASSIGNMENTS
================================ */

async function loadAssignments() {

    try {

        const response = await fetch(
            "http://localhost/apollo-backend/faculty/assignments.php",
            {
                credentials: "include"
            }
        );

        const data = await response.json();

        console.log("Assignments:", data);

        if (data.status !== "success") {
            alert(data.message || "Unable to load assignments.");
            return;
        }

        allAssignments = data.assignments || [];

        subjectSelect.innerHTML = `
            <option value="">Select Subject</option>
        `;

        assignmentSelect.innerHTML = `
            <option value="">Select Assignment</option>
        `;

        assignmentSelect.disabled = true;

        // Get unique subjects
        const subjects = [
            ...new Set(
                allAssignments.map(assignment => assignment.subject)
            )
        ];

        subjects.forEach(subject => {

            const option = document.createElement("option");

            option.value = subject;
            option.textContent = subject;

            subjectSelect.appendChild(option);

        });

    }
    catch (error) {

        console.error("Assignment loading error:", error);

        alert("Server error while loading assignments.");

    }

}


/* ================================
   LOAD ASSIGNMENTS BY SUBJECT
================================ */

function loadAssignmentsBySubject(subject) {

    assignmentSelect.innerHTML = `
        <option value="">Select Assignment</option>
    `;

    resetSubmissionPage();

    if (!subject) {

        assignmentSelect.disabled = true;
        return;

    }

    const filteredAssignments = allAssignments.filter(
        assignment => assignment.subject === subject
    );

    filteredAssignments.forEach(assignment => {

        const option = document.createElement("option");

        option.value = assignment.id;
        option.textContent = assignment.title;

        assignmentSelect.appendChild(option);

    });

    assignmentSelect.disabled = false;

}


/* ================================
   LOAD STUDENT SUBMISSIONS
================================ */

async function loadSubmissions(assignmentId) {

    resetSubmissionPage();

    if (!assignmentId) {
        return;
    }

    submissionsBody.innerHTML = `
        <tr>
            <td colspan="6">Loading submissions...</td>
        </tr>
    `;

    try {

        const response = await fetch(
            "http://localhost/apollo-backend/faculty/assignment_submissions.php?assignment_id=" +
            encodeURIComponent(assignmentId),
            {
                credentials: "include"
            }
        );

        const data = await response.json();

        console.log("Submissions:", data);

        if (data.status !== "success") {

            submissionsBody.innerHTML = `
                <tr>
                    <td colspan="6">Unable to load submissions: ${escapeHTML(data.message || "Unknown error")
                }</td>
                </tr>
            `;

            return;
        }

        allStudents = data.students || [];

        // Update summary cards
        totalStudents.textContent = data.total_students ?? 0;
        submittedStudents.textContent = data.submitted ?? 0;
        pendingStudents.textContent = data.pending ?? 0;
        overdueStudents.textContent = data.overdue ?? 0;

        renderStudents(assignmentId);

    }
    catch (error) {

        console.error("Submission loading error:", error);

        submissionsBody.innerHTML = `
            <tr>
                <td colspan="6">Server error while loading submissions.</td>
            </tr>
        `;

    }

}


/* ================================
   DISPLAY STUDENT TABLE
================================ */

function renderStudents(assignmentId) {

    const searchText = studentSearch.value
        .trim()
        .toLowerCase();

    const selectedStatus = statusFilter.value;

    const filteredStudents = allStudents.filter(student => {

        const matchesSearch =
            (student.name || "").toLowerCase().includes(searchText) ||
            (student.roll_no || "").toLowerCase().includes(searchText);

        const matchesStatus =
            selectedStatus === "All" ||
            student.status === selectedStatus;

        return matchesSearch && matchesStatus;

    });

    submissionsBody.innerHTML = "";

    if (filteredStudents.length === 0) {

        submissionsBody.innerHTML = `
            <tr>
                <td colspan="6">No students found.</td>
            </tr>
        `;

        return;
    }

    filteredStudents.forEach((student, index) => {

        let submittedAt = "-";
        let fileButton = "-";

        if (student.submitted_at) {

            submittedAt = formatDateTime(student.submitted_at);

        }

        if (
            student.status === "Submitted" ||
            student.status === "Submitted Late"
        ) {

            fileButton = `
                <a
                    href="http://localhost/apollo-backend/faculty/download_submission.php?assignment_id=${encodeURIComponent(assignmentId)}&student_id=${encodeURIComponent(student.id)}"
                    class="download-btn"
                >
                    Download
                </a>
            `;

        }

        const row = document.createElement("tr");

        const statusClass = student.status
            .toLowerCase()
            .replace(/\s+/g, "-");

        row.innerHTML = `
            <td>${index + 1}</td>

            <td>${escapeHTML(student.name)}</td>

            <td>${escapeHTML(student.roll_no)}</td>

            <td>
                <span class="status ${statusClass}">
                    ${escapeHTML(student.status)}
                </span>
            </td>

            <td>${escapeHTML(submittedAt)}</td>

            <td>${fileButton}</td>
        `;

        submissionsBody.appendChild(row);

    });

}


/* ================================
   RESET PAGE
================================ */

function resetSubmissionPage() {

    totalStudents.textContent = "0";
    submittedStudents.textContent = "0";
    pendingStudents.textContent = "0";
    overdueStudents.textContent = "0";

    allStudents = [];

    if (studentSearch) {
        studentSearch.value = "";
    }

    if (statusFilter) {
        statusFilter.value = "All";
    }

    submissionsBody.innerHTML = `
        <tr>
            <td colspan="6">Select an assignment</td>
        </tr>
    `;

}


/* ================================
   FORMAT DATE + TIME
================================ */

function formatDateTime(dateTime) {

    if (!dateTime) {
        return "-";
    }

    const date = new Date(
        dateTime.replace(" ", "T")
    );

    if (isNaN(date.getTime())) {
        return dateTime;
    }

    return date.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });

}


/* ================================
   ESCAPE HTML
================================ */

function escapeHTML(value) {

    return String(value ?? "").replace(/[&<>"']/g, character => {

        const characters = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        };

        return characters[character];

    });

}


/* ================================
   SUBJECT DROPDOWN
================================ */

subjectSelect.addEventListener("change", function () {

    loadAssignmentsBySubject(this.value);

});


/* ================================
   ASSIGNMENT DROPDOWN
================================ */

assignmentSelect.addEventListener("change", function () {

    loadSubmissions(this.value);

});


/* ================================
   SEARCH STUDENTS
================================ */

studentSearch.addEventListener("input", function () {

    if (assignmentSelect.value) {
        renderStudents(assignmentSelect.value);
    }

});


/* ================================
   STATUS FILTER
================================ */

statusFilter.addEventListener("change", function () {

    if (assignmentSelect.value) {
        renderStudents(assignmentSelect.value);
    }

});


/* ================================
   START
================================ */

loadAssignments();
