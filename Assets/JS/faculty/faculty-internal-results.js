
const API_URL = "http://localhost/apollo-backend";

let allStudents = [];
let allResults = [];

// =========================================
// PAGE INITIALIZATION
// =========================================

document.addEventListener("DOMContentLoaded", function () {

    loadStudents();
    loadResults();

    document.getElementById("semester")
        .addEventListener("change", async function () {

            await loadStudents();
            await loadSubjects();

        });

    document.getElementById("filterSemester")
        .addEventListener("change", loadResults);

    document.getElementById("internalResultForm")
        .addEventListener("submit", saveInternalResult);

    document.getElementById("cancelEditBtn")
        .addEventListener("click", resetForm);

});


// =========================================
// API REQUEST HELPER
// =========================================

async function postData(url, data) {

    const response = await fetch(API_URL + url, {

        method: "POST",

        credentials: "include",

        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },

        body: new URLSearchParams(data)

    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.message || "Request failed.");
    }

    return result;

}


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

        allStudents = data.students || [];

        const filteredStudents = semester
            ? allStudents.filter(student =>
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
// LOAD ASSIGNED SUBJECTS
// =========================================

async function loadSubjects() {

    const semester =
        document.getElementById("semester").value;

    const subjectSelect =
        document.getElementById("subject");

    subjectSelect.innerHTML =
        '<option value="">Select Subject</option>';

    if (!semester) {
        return;
    }

    try {

        const response = await fetch(

            API_URL +
            "/results/subjects.php?role=faculty&course=BCA&semester=" +
            encodeURIComponent(semester),

            {
                credentials: "include"
            }

        );

        const data = await response.json();

        if (!response.ok || data.status !== "success") {
            throw new Error(data.message || "Unable to load subjects.");
        }

        const subjects = data.subjects || [];

        subjects.forEach(subject => {

            const option = document.createElement("option");

            option.value = subject.subject_name;

            option.textContent = subject.subject_name;

            subjectSelect.appendChild(option);

        });

        if (subjects.length === 0) {

            subjectSelect.innerHTML =
                '<option value="">No assigned subjects</option>';

        }

    }

    catch (error) {

        console.error("Subject Error:", error);

        subjectSelect.innerHTML =
            '<option value="">Unable to load subjects</option>';

        showMessage(error.message, "error");

    }

}


// =========================================
// LOAD INTERNAL RESULTS
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
            <td colspan="10">Loading results...</td>
        </tr>
    `;

    try {

        let url =
            API_URL +
            "/results/admin-internal-list.php?role=faculty";

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
            allResults.length + " Internal Results";

    }

    catch (error) {

        console.error("Results Error:", error);

        table.innerHTML = `
            <tr>
                <td colspan="10">Unable to load results.</td>
            </tr>
        `;

        count.textContent = "Error loading results";

    }

}


// =========================================
// DISPLAY RESULTS
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


function displayResults(results) {

    const table =
        document.getElementById("resultTable");

    const count =
        document.getElementById("resultCount");

    count.textContent =
        results.length + " Internal Results";

    if (results.length === 0) {

        table.innerHTML = `
            <tr>
                <td colspan="10">
                    No internal results found.
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

            <td>${escapeHTML(result.subject_name)}</td>

            <td>${escapeHTML(result.exam_type)}</td>

            <td>
                ${escapeHTML(result.marks_obtained)}
                /
                ${escapeHTML(result.total_marks)}
            </td>

            <td>${escapeHTML(result.academic_year)}</td>

            <td>
                <span class="${published ? "published-status" : "unpublished-status"}">
                    ${published ? "Published" : "Unpublished"}
                </span>
            </td>

            <td class="result-actions">

                <button
                    class="edit-btn"
                    data-action="edit"
                    data-id="${Number(result.id)}">
                    Edit
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
// RESULT TABLE ACTIONS
// =========================================

document.getElementById("resultTable")
    .addEventListener("click", function (event) {

        const button = event.target.closest("button[data-action]");

        if (!button) {
            return;
        }

        const resultId = Number(button.dataset.id);

        const action = button.dataset.action;

        if (action === "edit") {
            editResult(resultId);
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
// SAVE / UPDATE INTERNAL RESULT
// =========================================

async function saveInternalResult(event) {

    event.preventDefault();

    const resultId =
        document.getElementById("resultId").value;

    const studentId =
        document.getElementById("student").value;

    const semester =
        document.getElementById("semester").value;

    const subjectName =
        document.getElementById("subject").value;

    const examType =
        document.getElementById("examType").value;

    const marksObtained =
        document.getElementById("marksObtained").value;

    const totalMarks =
        document.getElementById("totalMarks").value;

    const academicYear =
        document.getElementById("academicYear").value.trim();

    if (
        !studentId ||
        !semester ||
        !subjectName ||
        !examType ||
        marksObtained === "" ||
        totalMarks === "" ||
        !academicYear
    ) {

        showMessage("Please fill all fields.", "error");

        return;

    }

    if (
        Number(totalMarks) <= 0 ||
        Number(marksObtained) < 0 ||
        Number(marksObtained) > Number(totalMarks)
    ) {

        showMessage("Please enter valid marks.", "error");

        return;

    }

    const saveBtn =
        document.getElementById("saveBtn");

    saveBtn.disabled = true;

    saveBtn.textContent = "Saving...";

    const formData = {

        role: "faculty",
        student_id: studentId,
        semester: semester,
        subject_name: subjectName,
        exam_type: examType,
        marks_obtained: marksObtained,
        total_marks: totalMarks,
        academic_year: academicYear

    };

    try {

        let data;

        if (resultId) {

            formData.result_id = resultId;

            data = await postData(
                "/results/update-internal.php",
                formData
            );

        } else {

            data = await postData(
                "/results/save-internal.php",
                formData
            );

        }

        if (data.status !== "success") {
            throw new Error(data.message || "Unable to save result.");
        }

        showMessage(data.message, "success");

        resetForm();

        await loadResults();

    }

    catch (error) {

        console.error("Save Result Error:", error);

        showMessage(error.message, "error");

    }

    finally {

        saveBtn.disabled = false;

        saveBtn.textContent = "Save Internal Marks";

    }

}


// =========================================
// EDIT RESULT
// =========================================

async function editResult(resultId) {

    const result =
        allResults.find(item => Number(item.id) === resultId);

    if (!result) {

        alert("Result not found.");

        return;

    }

    document.getElementById("resultId").value =
        result.id;

    document.getElementById("semester").value =
        result.semester;

    await loadStudents();

    await loadSubjects();

    document.getElementById("student").value =
        result.student_id;

    document.getElementById("subject").value =
        result.subject_name;

    document.getElementById("examType").value =
        result.exam_type;

    document.getElementById("marksObtained").value =
        result.marks_obtained;

    document.getElementById("totalMarks").value =
        result.total_marks;

    document.getElementById("academicYear").value =
        result.academic_year;

    document.getElementById("formTitle").textContent =
        "Edit Internal Marks";

    document.getElementById("saveBtn").textContent =
        "Update Internal Marks";

    document.getElementById("cancelEditBtn").hidden =
        false;

    document.getElementById("internalResultForm")
        .scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

}


// =========================================
// DELETE RESULT
// =========================================

async function deleteResult(resultId) {

    const confirmed = confirm(
        "Are you sure you want to delete this internal result?"
    );

    if (!confirmed) {
        return;
    }

    try {

        const data = await postData(
            "/results/delete-internal.php",
            {
                role: "faculty",
                result_id: resultId
            }
        );

        if (data.status !== "success") {
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
// PUBLISH / UNPUBLISH RESULT
// =========================================

async function togglePublish(resultId, published) {

    const action = published === 1
        ? "publish"
        : "unpublish";

    const confirmed = confirm(
        "Are you sure you want to " + action + " this result?"
    );

    if (!confirmed) {
        return;
    }

    try {

        const data = await postData(
            "/results/publish-internal.php",
            {
                role: "faculty",
                result_id: resultId,
                published: published
            }
        );

        if (data.status !== "success") {
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

    document.getElementById("internalResultForm").reset();

    document.getElementById("resultId").value = "";

    document.getElementById("formTitle").textContent =
        "Add Internal Marks";

    document.getElementById("saveBtn").textContent =
        "Save Internal Marks";

    document.getElementById("cancelEditBtn").hidden =
        true;

    document.getElementById("student").innerHTML =
        '<option value="">Select Student</option>';

    document.getElementById("subject").innerHTML =
        '<option value="">Select Subject</option>';

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
