
const API_URL = "http://localhost/apollo-backend";

let allResults = [];

// =========================================
// PAGE INITIALIZATION
// =========================================

document.addEventListener("DOMContentLoaded", function () {

    loadStudents();
    loadResults();

    document.getElementById("semester")
        .addEventListener("change", loadStudents);

    document.getElementById("filterSemester")
        .addEventListener("change", loadResults);

    document.getElementById("externalResultForm")
        .addEventListener("submit", uploadExternalResult);

    document.getElementById("cancelEditBtn")
        .addEventListener("click", resetForm);

});


// =========================================
// LOAD STUDENTS
// =========================================

async function loadStudents() {

    const studentSelect =
        document.getElementById("student");

    const semester =
        parseInt(document.getElementById("semester").value) || 0;

    try {

        const response = await fetch(
            API_URL + "/faculty/students.php",
            {
                credentials: "include"
            }
        );

        const data = await response.json();

        if (!response.ok || data.status !== "success") {
            throw new Error(data.message || "Unable to load students.");
        }

        const students = data.students || [];

        const filteredStudents = semester
            ? students.filter(student =>
                Number(student.semester) >= semester
            )
            : [];

        studentSelect.innerHTML =
            '<option value="">Select Student</option>';

        filteredStudents.forEach(student => {

            const option = document.createElement("option");

            option.value = student.id;

            option.textContent =
                student.name + " (" + student.roll_no + ")";

            studentSelect.appendChild(option);

        });

        if (semester && filteredStudents.length === 0) {

            studentSelect.innerHTML =
                '<option value="">No eligible students found</option>';

        }

    }

    catch (error) {

        console.error("Student Error:", error);

        studentSelect.innerHTML =
            '<option value="">Unable to load students</option>';

        showMessage(error.message, "error");

    }

}


// =========================================
// LOAD EXTERNAL RESULTS
// =========================================

async function loadResults() {

    const table =
        document.getElementById("resultTable");

    const count =
        document.getElementById("resultCount");

    const semester =
        document.getElementById("filterSemester").value;

    table.innerHTML = `
        <tr>
            <td colspan="8">Loading results...</td>
        </tr>
    `;

    try {

        let url =
            API_URL +
            "/results/admin-external-list.php?role=faculty";

        if (semester) {

            url += "&semester=" + encodeURIComponent(semester);

        }

        const response = await fetch(url, {
            credentials: "include"
        });

        const data = await response.json();

        if (!response.ok || data.success !== true) {

            throw new Error(data.message || "Unable to load results.");

        }

        allResults = data.results || [];

        displayResults(allResults);

        count.textContent =
            allResults.length + " External Results";

    }

    catch (error) {

        console.error("Results Error:", error);

        table.innerHTML = `
            <tr>
                <td colspan="8">Unable to load results.</td>
            </tr>
        `;

        count.textContent = "Error loading results";

    }

}


// =========================================
// ESCAPE HTML
// =========================================

function escapeHTML(value) {

    return String(value ?? "").replace(/[&<>"']/g, function (char) {

        const entities = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        };

        return entities[char];

    });

}


// =========================================
// DISPLAY RESULTS
// =========================================

function displayResults(results) {

    const table =
        document.getElementById("resultTable");

    const count =
        document.getElementById("resultCount");

    count.textContent =
        results.length + " External Results";

    if (results.length === 0) {

        table.innerHTML = `
            <tr>
                <td colspan="8">
                    No external results found.
                </td>
            </tr>
        `;

        return;

    }

    table.innerHTML = "";

    results.forEach((result, index) => {

        const published =
            Number(result.published) === 1;

        const row = document.createElement("tr");

        row.innerHTML = `

            <td>${index + 1}</td>

            <td>${escapeHTML(result.student_name)}</td>

            <td>${escapeHTML(result.roll_no)}</td>

            <td>${escapeHTML(result.semester)}</td>

            <td>${escapeHTML(result.academic_year)}</td>

            <td>
                ${escapeHTML(result.original_filename)}
            </td>

            <td>
                <span class="${published ? "published-status" : "unpublished-status"}">
                    ${published ? "Published" : "Unpublished"}
                </span>
            </td>

            <td class="result-actions">

            <button
                class="view-btn"
                data-action="view"
                data-id="${Number(result.id)}">
                View PDF
            </button>

            <button
                class="edit-btn"
                data-action="replace"
                data-id="${Number(result.id)}">
                Replace PDF
            </button>

                <button
                    class="publish-btn"
                    data-action="publish"
                    data-id="${Number(result.id)}"
                    data-published="${published ? 0 : 1}">
                    ${published ? "Unpublish" : "Publish"}
                </button>

                <button
                    class="delete-btn"
                    data-action="delete"
                    data-id="${Number(result.id)}">
                    Delete
                </button>

            </td>

        `;

        table.appendChild(row);

    });

}


// =========================================
// TABLE ACTIONS
// =========================================

document.getElementById("resultTable")
    .addEventListener("click", function (event) {

        const button =
            event.target.closest("button[data-action]");

        if (!button) {
            return;
        }

        const resultId =
            Number(button.dataset.id);

        const action =
            button.dataset.action;

        if (action === "view") {

            window.open(
                API_URL + "/faculty/view-external.php?id=" +
                encodeURIComponent(resultId),
                "_blank"
            );

        }

        if (action === "replace") {

            replaceResult(resultId);

        }

        if (action === "delete") {

            deleteResult(resultId);

        }

        if (action === "publish") {

            togglePublish(
                resultId,
                Number(button.dataset.published)
            );

        }

    });


// =========================================
// UPLOAD / REPLACE EXTERNAL RESULT
// =========================================

async function uploadExternalResult(event) {

    event.preventDefault();

    const form =
        document.getElementById("externalResultForm");

    const resultId =
        document.getElementById("resultId").value;

    const studentId =
        document.getElementById("student").value;

    const semester =
        document.getElementById("semester").value;

    const academicYear =
        document.getElementById("academicYear").value.trim();

    const fileInput =
        document.getElementById("resultFile");

    const file = fileInput.files[0];

    if (!studentId || !semester || !academicYear) {

        showMessage("Please fill all required fields.", "error");

        return;

    }

    if (!resultId && !file) {

        showMessage("Please select an external result PDF.", "error");

        return;

    }

    if (file) {

        if (
            file.type !== "application/pdf" ||
            !file.name.toLowerCase().endsWith(".pdf")
        ) {

            showMessage("Only PDF files are allowed.", "error");

            return;

        }

        if (file.size > 5 * 1024 * 1024) {

            showMessage("PDF file must be smaller than 5 MB.", "error");

            return;

        }

    }

    const uploadBtn =
        document.getElementById("uploadBtn");

    uploadBtn.disabled = true;

    uploadBtn.textContent =
        resultId ? "Replacing..." : "Uploading...";

    const formData = new FormData(form);

    formData.append("role", "faculty");

    try {

        const response = await fetch(
            API_URL + "/results/upload-external.php",
            {
                method: "POST",
                credentials: "include",
                body: formData
            }
        );

        const data = await response.json();

        if (!response.ok || data.success !== true) {

            throw new Error(data.message || "Unable to upload result.");

        }

        showMessage(data.message, "success");

        resetForm();

        await loadResults();

    }

    catch (error) {

        console.error("Upload Error:", error);

        showMessage(error.message, "error");

    }

    finally {

        uploadBtn.disabled = false;

        uploadBtn.textContent = "Upload External Result";

    }

}


// =========================================
// REPLACE EXISTING PDF
// =========================================

function replaceResult(resultId) {

    const result =
        allResults.find(item => Number(item.id) === resultId);

    if (!result) {

        alert("External result not found.");

        return;

    }

    document.getElementById("resultId").value =
        result.id;

    document.getElementById("semester").value =
        result.semester;

    loadStudents().then(() => {

        document.getElementById("student").value =
            result.student_id;

    });

    document.getElementById("academicYear").value =
        result.academic_year;

    document.getElementById("resultFile").required = true;

    document.getElementById("formTitle").textContent =
        "Replace External Result PDF";

    document.getElementById("uploadBtn").textContent =
        "Replace External Result";

    document.getElementById("cancelEditBtn").hidden =
        false;

    document.getElementById("externalResultForm")
        .scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    showMessage(
        "Select the new PDF file to replace the existing result.",
        "success"
    );

}


// =========================================
// DELETE EXTERNAL RESULT
// =========================================

async function deleteResult(resultId) {

    const confirmed = confirm(
        "Are you sure you want to delete this external result PDF?"
    );

    if (!confirmed) {
        return;
    }

    const formData = new FormData();

    formData.append("role", "faculty");
    formData.append("result_id", resultId);

    try {

        const response = await fetch(
            API_URL + "/results/delete-external.php",
            {
                method: "POST",
                credentials: "include",
                body: formData
            }
        );

        const data = await response.json();

        if (!response.ok || data.success !== true) {

            throw new Error(data.message || "Unable to delete result.");

        }

        alert(data.message);

        await loadResults();

    }

    catch (error) {

        console.error("Delete Error:", error);

        alert(error.message);

    }

}


// =========================================
// PUBLISH / UNPUBLISH EXTERNAL RESULT
// =========================================

async function togglePublish(resultId, published) {

    const action =
        published === 1 ? "publish" : "unpublish";

    const confirmed = confirm(
        "Are you sure you want to " + action + " this result?"
    );

    if (!confirmed) {
        return;
    }

    const formData = new FormData();

    formData.append("role", "faculty");
    formData.append("result_id", resultId);
    formData.append("published", published);

    try {

        const response = await fetch(
            API_URL + "/results/publish-external.php",
            {
                method: "POST",
                credentials: "include",
                body: formData
            }
        );

        const data = await response.json();

        if (!response.ok || data.success !== true) {

            throw new Error(data.message || "Unable to update result.");

        }

        alert(data.message);

        await loadResults();

    }

    catch (error) {

        console.error("Publish Error:", error);

        alert(error.message);

    }

}


// =========================================
// RESET FORM
// =========================================

function resetForm() {

    document.getElementById("externalResultForm").reset();

    document.getElementById("resultId").value = "";

    document.getElementById("resultFile").required = false;

    document.getElementById("formTitle").textContent =
        "Upload External Result";

    document.getElementById("uploadBtn").textContent =
        "Upload External Result";

    document.getElementById("cancelEditBtn").hidden =
        true;

    document.getElementById("student").innerHTML =
        '<option value="">Select Student</option>';

    document.getElementById("formMessage").textContent = "";

}


// =========================================
// FORM MESSAGE
// =========================================

function showMessage(message, type) {

    const element =
        document.getElementById("formMessage");

    element.textContent = message;

    element.className = type;

}
