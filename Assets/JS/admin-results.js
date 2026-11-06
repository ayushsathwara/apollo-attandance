
const API_URL = "http://localhost/apollo-backend";

let allStudents = [];
let allExternalResults = [];
let allInternalResults = [];

// =========================================
// PAGE INITIALIZATION
// =========================================

document.addEventListener("DOMContentLoaded", function () {

    initializeResultsPage();

    document.getElementById("logoutButton")
        .addEventListener("click", logoutAdmin);

    document.getElementById("externalTab")
        .addEventListener("click", function () {
            showSection("external");
        });

    document.getElementById("internalTab")
        .addEventListener("click", function () {
            showSection("internal");
            loadInternalResults();
        });

    // External Results events
    document.getElementById("studentId")
        .addEventListener("change", updateSemesterOptions);

    document.getElementById("externalResultForm")
        .addEventListener("submit", uploadExternalResult);

    document.getElementById("filterSemester")
        .addEventListener("change", loadExternalResults);

    // Internal Results events
    document.getElementById("internalStudentId")
        .addEventListener("change", updateInternalSemesterOptions);

    document.getElementById("internalSemester")
        .addEventListener("change", loadInternalSubjects);

    document.getElementById("internalResultForm")
        .addEventListener("submit", saveInternalResult);

    document.getElementById("internalFilterSemester")
        .addEventListener("change", loadInternalResults);

});


// =========================================
// INITIALIZE RESULTS PAGE
// =========================================

async function initializeResultsPage() {

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
            data.admin.name || "Admin";

        document.getElementById("adminEmail").textContent =
            data.admin.email || "";

        await loadStudents();
        await loadExternalResults();
        await loadInternalResults();

    } catch (error) {

        console.error("Results Page Error:", error);

        showMessage(
            "dashboardMessage",
            "Unable to load results page. Check XAMPP.",
            false
        );

    }
}


// =========================================
// SWITCH BETWEEN TABS
// =========================================

function showSection(section) {

    const externalSection =
        document.getElementById("externalSection");

    const internalSection =
        document.getElementById("internalSection");

    const externalTab =
        document.getElementById("externalTab");

    const internalTab =
        document.getElementById("internalTab");

    if (section === "external") {

        externalSection.hidden = false;
        internalSection.hidden = true;

        externalTab.classList.add("active");
        internalTab.classList.remove("active");

    } else {

        externalSection.hidden = true;
        internalSection.hidden = false;

        internalTab.classList.add("active");
        externalTab.classList.remove("active");

    }

}


// =========================================
// LOAD STUDENTS
// =========================================

async function loadStudents() {

    const studentSelect =
        document.getElementById("studentId");

    const internalStudentSelect =
        document.getElementById("internalStudentId");

    studentSelect.innerHTML =
        '<option value="">Loading students...</option>';

    internalStudentSelect.innerHTML =
        '<option value="">Loading students...</option>';

    const response = await fetch(
        `${API_URL}/admin/students.php`,
        { credentials: "include" }
    );

    if (response.status === 401) {
        window.location.href = "admin-login.html";
        return;
    }

    const data = await response.json();

    if (
        !response.ok ||
        !data.success ||
        !Array.isArray(data.students)
    ) {
        throw new Error(
            data.message || "Unable to load students."
        );
    }

    allStudents = data.students;

    studentSelect.innerHTML =
        '<option value="">Select Student</option>';

    internalStudentSelect.innerHTML =
        '<option value="">Select Student</option>';

    allStudents.forEach(function (student) {

        const externalOption =
            document.createElement("option");

        externalOption.value = student.id;

        externalOption.textContent =
            `${student.name} (${student.roll_no})`;

        studentSelect.appendChild(externalOption);


        const internalOption =
            document.createElement("option");

        internalOption.value = student.id;

        internalOption.textContent =
            `${student.name} (${student.roll_no})`;

        internalStudentSelect.appendChild(internalOption);

    });

    if (allStudents.length === 0) {

        studentSelect.innerHTML =
            '<option value="">No students available</option>';

        internalStudentSelect.innerHTML =
            '<option value="">No students available</option>';

    }

}


// =========================================
// EXTERNAL RESULTS - SEMESTER OPTIONS
// =========================================

function updateSemesterOptions() {

    const studentId =
        document.getElementById("studentId").value;

    const semesterSelect =
        document.getElementById("semester");

    const student = allStudents.find(function (item) {
        return String(item.id) === String(studentId);
    });

    semesterSelect.value = "";

    Array.from(semesterSelect.options).forEach(function (option) {

        if (!option.value) return;

        const semester = Number(option.value);

        option.disabled =
            !student ||
            semester > Number(student.semester);

    });

}


// =========================================
// EXTERNAL RESULTS - UPLOAD PDF
// =========================================

async function uploadExternalResult(event) {

    event.preventDefault();

    const form =
        document.getElementById("externalResultForm");

    const uploadButton =
        document.getElementById("uploadButton");

    const fileInput =
        document.getElementById("resultFile");

    const file = fileInput.files[0];

    if (!file) {

        showMessage(
            "uploadMessage",
            "Please select a PDF file.",
            false
        );

        return;
    }

    if (
        file.type !== "application/pdf" ||
        !file.name.toLowerCase().endsWith(".pdf")
    ) {

        showMessage(
            "uploadMessage",
            "Only PDF files are allowed.",
            false
        );

        return;
    }

    if (file.size > 5 * 1024 * 1024) {

        showMessage(
            "uploadMessage",
            "PDF must be smaller than 5 MB.",
            false
        );

        return;
    }

    const formData = new FormData(form);

    uploadButton.disabled = true;
    uploadButton.textContent = "Uploading...";

    showMessage(
        "uploadMessage",
        "Uploading result...",
        true
    );

    try {

        const response = await fetch(
            `${API_URL}/results/upload-external.php`,
            {
                method: "POST",
                credentials: "include",
                body: formData
            }
        );

        const data = await response.json();

        if (response.status === 401) {
            window.location.href = "admin-login.html";
            return;
        }

        if (!response.ok || !data.success) {
            throw new Error(
                data.message || "Upload failed."
            );
        }

        showMessage(
            "uploadMessage",
            data.message || "External result uploaded successfully.",
            true
        );

        form.reset();

        document.getElementById("semester").value = "";

        await loadExternalResults();

    } catch (error) {

        console.error("Upload Error:", error);

        showMessage(
            "uploadMessage",
            error.message || "Unable to upload result.",
            false
        );

    } finally {

        uploadButton.disabled = false;
        uploadButton.textContent = "Upload Result";

    }

}


// =========================================
// EXTERNAL RESULTS - LOAD RESULTS
// =========================================

async function loadExternalResults() {

    const tableBody =
        document.getElementById("externalResultsTable");

    const semester =
        document.getElementById("filterSemester").value;

    tableBody.innerHTML = `
        <tr>
            <td colspan="6">Loading results...</td>
        </tr>
    `;

    try {

        let url =
            `${API_URL}/results/admin-external-list.php`;

        if (semester) {
            url += `?semester=${encodeURIComponent(semester)}`;
        }

        const response = await fetch(url, {
            credentials: "include"
        });

        if (response.status === 401) {
            window.location.href = "admin-login.html";
            return;
        }

        const data = await response.json();

        if (
            !response.ok ||
            !data.success ||
            !Array.isArray(data.results)
        ) {
            throw new Error(
                data.message || "Unable to load results."
            );
        }

        allExternalResults = data.results;

        displayExternalResults();

    } catch (error) {

        console.error("Results Loading Error:", error);

        tableBody.innerHTML = "";

        const row = document.createElement("tr");
        const cell = document.createElement("td");

        cell.colSpan = 6;
        cell.textContent =
            error.message || "Unable to load results.";

        row.appendChild(cell);
        tableBody.appendChild(row);

    }

}


// =========================================
// EXTERNAL RESULTS - DISPLAY TABLE
// =========================================


function displayExternalResults() {

    const tableBody =
        document.getElementById("externalResultsTable");

    tableBody.innerHTML = "";

    if (allExternalResults.length === 0) {

        const row = document.createElement("tr");
        const cell = document.createElement("td");

        cell.colSpan = 6;
        cell.textContent = "No external results uploaded yet.";

        row.appendChild(cell);
        tableBody.appendChild(row);

        return;
    }

    allExternalResults.forEach(function (result) {

        const row = document.createElement("tr");

        const studentCell = document.createElement("td");
        studentCell.textContent = result.student_name || "—";

        const rollCell = document.createElement("td");
        rollCell.textContent = result.roll_no || "—";

        const semesterCell = document.createElement("td");
        semesterCell.textContent = `Semester ${result.semester}`;

        const yearCell = document.createElement("td");
        yearCell.textContent = result.academic_year || "—";

        const statusCell = document.createElement("td");

        const statusBadge = document.createElement("span");

        const isPublished = Number(result.published) === 1;

        statusBadge.className = isPublished
            ? "status-badge status-published"
            : "status-badge status-unpublished";

        statusBadge.textContent = isPublished
            ? "Published"
            : "Unpublished";

        statusCell.appendChild(statusBadge);

        const actionCell = document.createElement("td");

        // Publish / Unpublish
        const publishButton = document.createElement("button");

        publishButton.type = "button";

        publishButton.className = isPublished
            ? "table-button unpublish"
            : "table-button";

        publishButton.textContent = isPublished
            ? "Unpublish"
            : "Publish";

        publishButton.addEventListener("click", function () {

            togglePublishStatus(
                result.id,
                isPublished ? 0 : 1,
                publishButton
            );

        });

        // Replace PDF
        const replaceButton = document.createElement("button");

        replaceButton.type = "button";
        replaceButton.className = "table-button edit";
        replaceButton.textContent = "Replace PDF";

        replaceButton.addEventListener("click", function () {
            editExternalResult(result);
        });

        // Delete Result
        const deleteButton = document.createElement("button");

        deleteButton.type = "button";
        deleteButton.className = "table-button delete";
        deleteButton.textContent = "Delete";

        deleteButton.addEventListener("click", function () {
            deleteExternalResult(result.id, deleteButton);
        });

        actionCell.append(
            publishButton,
            replaceButton,
            deleteButton
        );

        row.append(
            studentCell,
            rollCell,
            semesterCell,
            yearCell,
            statusCell,
            actionCell
        );

        tableBody.appendChild(row);

    });

}


function editExternalResult(result) {

    // Fill existing result details in upload form
    document.getElementById("studentId").value =
        result.student_id;

    updateSemesterOptions();

    document.getElementById("semester").value =
        result.semester;

    document.getElementById("academic_year").value =
        result.academic_year;

    // Require a new PDF for replacement
    document.getElementById("resultFile").value = "";

    document.getElementById("uploadButton").textContent =
        "Replace External Result";

    document.getElementById("uploadMessage").textContent =
        "Select the new PDF and upload it to replace the existing result.";

    document.getElementById("externalResultForm")
        .scrollIntoView({
            behavior: "smooth",
            block: "center"
        });

}


async function deleteExternalResult(resultId, button) {

    const confirmed = confirm(
        "Are you sure you want to delete this external result? The PDF will also be deleted permanently."
    );

    if (!confirmed) {
        return;
    }

    button.disabled = true;
    button.textContent = "Deleting...";

    try {

        const formData = new FormData();

        formData.append("result_id", resultId);

        const response = await fetch(
            `${API_URL}/results/delete-external.php`,
            {
                method: "POST",
                body: formData,
                credentials: "include"
            }
        );

        const data = await response.json();

        if (!data.success) {
            throw new Error(
                data.message || "Unable to delete result"
            );
        }

        document.getElementById("resultsMessage").textContent =
            data.message;

        loadExternalResults();

    } catch (error) {

        button.disabled = false;
        button.textContent = "Delete";

        document.getElementById("resultsMessage").textContent =
            error.message;

    }

}


// =========================================
// EXTERNAL RESULTS - PUBLISH / UNPUBLISH
// =========================================

async function togglePublishStatus(resultId, published, button) {

    const action = published === 1 ? "publish" : "unpublish";

    if (!confirm(`Are you sure you want to ${action} this result?`)) {
        return;
    }

    button.disabled = true;
    button.textContent = "Updating...";

    try {

        const formData = new FormData();

        formData.append("result_id", resultId);
        formData.append("published", published);

        const response = await fetch(
            `${API_URL}/results/publish-external.php`,
            {
                method: "POST",
                credentials: "include",
                body: formData
            }
        );

        const data = await response.json();

        if (response.status === 401) {
            window.location.href = "admin-login.html";
            return;
        }

        if (!response.ok || !data.success) {
            throw new Error(
                data.message || "Status update failed."
            );
        }

        await loadExternalResults();

        showMessage("resultsMessage", data.message, true);

    } catch (error) {

        console.error("External Publish Error:", error);

        showMessage(
            "resultsMessage",
            error.message || "Unable to update result.",
            false
        );

        button.disabled = false;
        button.textContent = published === 1 ? "Publish" : "Unpublish";

    }

}


// =========================================
// INTERNAL RESULTS - SEMESTER OPTIONS
// =========================================

function updateInternalSemesterOptions() {

    const studentId =
        document.getElementById("internalStudentId").value;

    const semesterSelect =
        document.getElementById("internalSemester");

    const subjectSelect =
        document.getElementById("internalSubject");

    const student = allStudents.find(function (item) {
        return String(item.id) === String(studentId);
    });

    semesterSelect.value = "";

    Array.from(semesterSelect.options).forEach(function (option) {

        if (!option.value) return;

        const semester = Number(option.value);

        option.disabled =
            !student ||
            semester > Number(student.semester);

    });

    subjectSelect.innerHTML =
        '<option value="">Select Semester First</option>';

}


// =========================================
// INTERNAL RESULTS - LOAD SUBJECTS
// =========================================

async function loadInternalSubjects() {

    const semester =
        document.getElementById("internalSemester").value;

    const subjectSelect =
        document.getElementById("internalSubject");

    subjectSelect.innerHTML =
        '<option value="">Loading subjects...</option>';

    if (!semester) {

        subjectSelect.innerHTML =
            '<option value="">Select Semester First</option>';

        return;

    }

    try {

        const url =
            `${API_URL}/results/subjects.php?role=admin&course=BCA&semester=${encodeURIComponent(semester)}`;

        const response = await fetch(url, {
            credentials: "include"
        });

        if (response.status === 401) {
            window.location.href = "admin-login.html";
            return;
        }

        const data = await response.json();

        if (!response.ok || data.status !== "success") {
            throw new Error(
                data.message || "Unable to load subjects."
            );
        }

        subjectSelect.innerHTML =
            '<option value="">Select Subject</option>';

        if (!Array.isArray(data.subjects) || data.subjects.length === 0) {

            subjectSelect.innerHTML =
                '<option value="">No subjects added for this semester</option>';

            return;

        }

        data.subjects.forEach(function (subject) {

            const option = document.createElement("option");

            option.value = subject.subject_name;
            option.textContent = subject.subject_name;

            subjectSelect.appendChild(option);

        });

    } catch (error) {

        console.error("Subject Loading Error:", error);

        subjectSelect.innerHTML =
            '<option value="">Unable to load subjects</option>';

        showMessage("internalMessage", error.message, false);

    }

}


// =========================================
// INTERNAL RESULTS - SAVE MARKS
// =========================================

async function saveInternalResult(event) {

    event.preventDefault();

    const form =
        document.getElementById("internalResultForm");

    const button =
        document.getElementById("saveInternalButton");

    const formData = new FormData(form);

    // Check whether we are editing or adding
    const resultId =
        document.getElementById("internalResultId")?.value || "";

    const isEditing = resultId !== "";

    formData.append("role", "admin");

    button.disabled = true;
    button.textContent = isEditing ? "Updating..." : "Saving...";

    showMessage(
        "internalMessage",
        isEditing ? "Updating internal marks..." : "Saving internal marks...",
        true
    );

    try {

        const endpoint = isEditing
            ? "update-internal.php"
            : "save-internal.php";

        const response = await fetch(
            `${API_URL}/results/${endpoint}`,
            {
                method: "POST",
                credentials: "include",
                body: formData
            }
        );

        const data = await response.json();

        if (response.status === 401) {
            window.location.href = "admin-login.html";
            return;
        }

        if (!response.ok || data.status !== "success") {
            throw new Error(
                data.message || "Unable to save internal marks."
            );
        }

        showMessage(
            "internalMessage",
            data.message || (
                isEditing
                    ? "Internal marks updated successfully."
                    : "Internal marks saved successfully."
            ),
            true
        );

        form.reset();

        document.getElementById("internalSubject").innerHTML =
            '<option value="">Select Semester First</option>';

        // Clear edit mode
        const resultIdField =
            document.getElementById("internalResultId");

        if (resultIdField) {
            resultIdField.value = "";
        }

        button.textContent = "Save Internal Marks";

        updateInternalSemesterOptions();

        await loadInternalResults();

    } catch (error) {

        console.error("Internal Result Error:", error);

        showMessage(
            "internalMessage",
            error.message || "Unable to save internal marks.",
            false
        );

    } finally {

        button.disabled = false;

        if (
            document.getElementById("internalResultId")?.value
        ) {
            button.textContent = "Update Internal Marks";
        } else {
            button.textContent = "Save Internal Marks";
        }

    }

}


// =========================================
// INTERNAL RESULTS - LOAD RECORDS
// =========================================

async function loadInternalResults() {

    const tableBody =
        document.getElementById("internalResultsTable");

    if (!tableBody) return;

    const semester =
        document.getElementById("internalFilterSemester").value;

    tableBody.innerHTML = `
        <tr>
            <td colspan="9">Loading internal results...</td>
        </tr>
    `;

    try {

        let url =
            `${API_URL}/results/admin-internal-list.php`;

        if (semester) {
            url += `?semester=${encodeURIComponent(semester)}`;
        }

        const response = await fetch(url, {
            credentials: "include"
        });

        if (response.status === 401) {
            window.location.href = "admin-login.html";
            return;
        }

        const data = await response.json();

        if (
            !response.ok ||
            !data.success ||
            !Array.isArray(data.results)
        ) {
            throw new Error(
                data.message || "Unable to load internal results."
            );
        }

        allInternalResults = data.results;

        displayInternalResults();

    } catch (error) {

        console.error("Internal Results Loading Error:", error);

        tableBody.innerHTML = "";

        const row = document.createElement("tr");
        const cell = document.createElement("td");

        cell.colSpan = 9;
        cell.textContent =
            error.message || "Unable to load internal results.";

        row.appendChild(cell);
        tableBody.appendChild(row);

    }

}


// =========================================
// INTERNAL RESULTS - DISPLAY RECORDS
// =========================================

function displayInternalResults() {

    const tableBody =
        document.getElementById("internalResultsTable");

    tableBody.innerHTML = "";

    if (allInternalResults.length === 0) {

        const row = document.createElement("tr");
        const cell = document.createElement("td");

        cell.colSpan = 9;
        cell.textContent = "No internal results entered yet.";

        row.appendChild(cell);
        tableBody.appendChild(row);

        return;

    }

    allInternalResults.forEach(function (result) {

        const row = document.createElement("tr");

        // Student
        const studentCell = document.createElement("td");
        studentCell.textContent = result.student_name || "—";

        // Roll Number
        const rollCell = document.createElement("td");
        rollCell.textContent = result.roll_no || "—";

        // Semester
        const semesterCell = document.createElement("td");
        semesterCell.textContent = `Semester ${result.semester}`;

        // Subject
        const subjectCell = document.createElement("td");
        subjectCell.textContent = result.subject_name || "—";

        // Exam Type
        const examCell = document.createElement("td");
        examCell.textContent = result.exam_type || "—";

        // Marks
        const marksCell = document.createElement("td");
        marksCell.textContent =
            `${result.marks_obtained} / ${result.total_marks}`;

        // Academic Year
        const yearCell = document.createElement("td");
        yearCell.textContent = result.academic_year || "—";

        // Status
        const statusCell = document.createElement("td");

        const isPublished = Number(result.published) === 1;

        const statusBadge = document.createElement("span");

        statusBadge.className = isPublished
            ? "status-badge status-published"
            : "status-badge status-unpublished";

        statusBadge.textContent = isPublished
            ? "Published"
            : "Unpublished";

        statusCell.appendChild(statusBadge);

        // =====================================
        // ACTIONS
        // =====================================

        const actionCell = document.createElement("td");

        // Publish / Unpublish
        const publishButton = document.createElement("button");

        publishButton.type = "button";

        publishButton.className = isPublished
            ? "table-button unpublish"
            : "table-button";

        publishButton.textContent = isPublished
            ? "Unpublish"
            : "Publish";

        publishButton.addEventListener("click", function () {

            toggleInternalPublishStatus(
                result.id,
                isPublished ? 0 : 1,
                publishButton
            );

        });

        // Edit
        const editButton = document.createElement("button");

        editButton.type = "button";
        editButton.className = "table-button";
        editButton.textContent = "Edit";

        editButton.addEventListener("click", function () {

            editInternalResult(result);

        });

        // Delete
        const deleteButton = document.createElement("button");

        deleteButton.type = "button";
        deleteButton.className = "table-button unpublish";
        deleteButton.textContent = "Delete";

        deleteButton.addEventListener("click", function () {

            deleteInternalResult(
                result.id,
                deleteButton
            );

        });

        actionCell.append(
            publishButton,
            editButton,
            deleteButton
        );

        row.append(
            studentCell,
            rollCell,
            semesterCell,
            subjectCell,
            examCell,
            marksCell,
            yearCell,
            statusCell,
            actionCell
        );

        tableBody.appendChild(row);

    });

}

async function editInternalResult(result) {

    const form = document.getElementById("internalResultForm");

    // Store result ID
    document.getElementById("internalResultId").value =
        result.id;

    // Fill student
    document.getElementById("internalStudentId").value =
        result.student_id;

    // Fill semester
    const semesterSelect =
        document.getElementById("internalSemester");

    semesterSelect.value = result.semester;

    // Load subjects for selected semester
    await loadInternalSubjects();

    // Fill remaining fields
    document.getElementById("internalSubject").value =
        result.subject_name;

    document.getElementById("examType").value =
        result.exam_type;

    document.getElementById("marksObtained").value =
        result.marks_obtained;

    document.getElementById("totalMarks").value =
        result.total_marks;

    document.getElementById("internalAcademicYear").value =
        result.academic_year;

    // Change button
    document.getElementById("saveInternalButton").textContent =
        "Update Internal Marks";

    showMessage(
        "internalMessage",
        "Editing selected result. Make your changes and click Update Internal Marks.",
        true
    );

    // Scroll to form
    form.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

}

async function deleteInternalResult(resultId, button) {

    const confirmed = confirm(
        "Are you sure you want to permanently delete this internal result?"
    );

    if (!confirmed) {
        return;
    }

    button.disabled = true;
    button.textContent = "Deleting...";

    const formData = new FormData();

    formData.append("result_id", resultId);
    formData.append("role", "admin");

    try {

        const response = await fetch(
            `${API_URL}/results/delete-internal.php`,
            {
                method: "POST",
                credentials: "include",
                body: formData
            }
        );

        const data = await response.json();

        if (response.status === 401) {
            window.location.href = "admin-login.html";
            return;
        }

        if (!response.ok || data.status !== "success") {
            throw new Error(
                data.message || "Unable to delete result."
            );
        }

        alert(data.message);

        // Reload results
        await loadInternalResults();

    } catch (error) {

        console.error("Delete Internal Result Error:", error);

        alert(
            error.message || "Unable to delete internal result."
        );

        button.disabled = false;
        button.textContent = "Delete";

    }

}


// =========================================
// INTERNAL RESULTS - PUBLISH / UNPUBLISH
// =========================================

async function toggleInternalPublishStatus(
    resultId,
    published,
    button
) {

    const action =
        published === 1 ? "publish" : "unpublish";

    const confirmed = confirm(
        `Are you sure you want to ${action} this internal result?`
    );

    if (!confirmed) return;

    button.disabled = true;
    button.textContent = "Updating...";

    try {

        const formData = new FormData();

        formData.append("result_id", resultId);
        formData.append("role", "admin");
        formData.append("published", published);

        const response = await fetch(
            `${API_URL}/results/publish-internal.php`,
            {
                method: "POST",
                credentials: "include",
                body: formData
            }
        );

        const data = await response.json();

        if (response.status === 401) {
            window.location.href = "admin-login.html";
            return;
        }

        if (!response.ok || data.status !== "success") {
            throw new Error(
                data.message || "Unable to update internal result."
            );
        }

        await loadInternalResults();

        showMessage(
            "internalResultsMessage",
            data.message || "Internal result status updated.",
            true
        );

    } catch (error) {

        console.error("Internal Publish Error:", error);

        showMessage(
            "internalResultsMessage",
            error.message || "Unable to update result.",
            false
        );

        button.disabled = false;

        button.textContent =
            published === 1 ? "Publish" : "Unpublish";

    }

}


// =========================================
// COMMON MESSAGE FUNCTION
// =========================================

function showMessage(elementId, message, success) {

    const element =
        document.getElementById(elementId);

    if (!element) return;

    element.textContent = message;

    element.style.color =
        success ? "#15803d" : "#dc2626";

}


// =========================================
// ADMIN LOGOUT
// =========================================

async function logoutAdmin() {

    try {

        const response = await fetch(
            `${API_URL}/admin/logout.php`,
            {
                method: "POST",
                credentials: "include"
            }
        );

        if (!response.ok) {
            throw new Error("Logout failed.");
        }

        window.location.href = "admin-login.html";

    } catch (error) {

        console.error("Logout Error:", error);

        alert(
            "Unable to log out. Please check your server."
        );

    }

}
