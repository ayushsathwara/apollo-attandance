
const API_URL = "http://localhost/apollo-backend";

let allInternalResults = [];
let allExternalResults = [];

// =========================================
// PAGE INITIALIZATION
// =========================================

document.addEventListener("DOMContentLoaded", function () {

    loadInternalResults();
    loadExternalResults();

    document.getElementById("semesterFilter")
        .addEventListener("change", filterResults);

});

// =========================================
// LOAD INTERNAL RESULTS
// =========================================

async function loadInternalResults() {

    const tbody = document.getElementById("internalResultsBody");

    try {

        const response = await fetch(
            `${API_URL}/student/get-internal-results.php`,
            {
                method: "GET",
                credentials: "include"
            }
        );

        const data = await response.json();

        if (response.status === 401) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6">Please login as a student to view results.</td>
                </tr>
            `;
            return;
        }

        if (!response.ok || !data.success) {
            throw new Error(data.message || "Unable to load internal results.");
        }

        allInternalResults = Array.isArray(data.results)
            ? data.results
            : [];

        renderInternalResults(allInternalResults);

    } catch (error) {

        console.error("Internal Results Error:", error);

        tbody.innerHTML = `
            <tr>
                <td colspan="6">Unable to load internal results. Please try again.</td>
            </tr>
        `;

    }

}

// =========================================
// LOAD EXTERNAL RESULTS
// =========================================

async function loadExternalResults() {

    const tbody = document.getElementById("externalResultsBody");

    try {

        const response = await fetch(
            `${API_URL}/student/get-external-results.php`,
            {
                method: "GET",
                credentials: "include"
            }
        );

        const data = await response.json();

        if (response.status === 401) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5">Please login as a student to view results.</td>
                </tr>
            `;
            return;
        }

        if (!response.ok || !data.success) {
            throw new Error(data.message || "Unable to load external results.");
        }

        allExternalResults = Array.isArray(data.results)
            ? data.results
            : [];

        renderExternalResults(allExternalResults);

    } catch (error) {

        console.error("External Results Error:", error);

        tbody.innerHTML = `
            <tr>
                <td colspan="5">Unable to load external results. Please try again.</td>
            </tr>
        `;

    }

}

// =========================================
// RENDER INTERNAL RESULTS
// =========================================

function renderInternalResults(results) {

    const tbody = document.getElementById("internalResultsBody");

    if (!results.length) {

        tbody.innerHTML = `
            <tr>
                <td colspan="6">No published internal results available.</td>
            </tr>
        `;

        return;
    }

    tbody.innerHTML = results.map(result => {

        return `
            <tr>
                <td>${escapeHTML(result.subject_name)}</td>
                <td>Semester ${escapeHTML(result.semester)}</td>
                <td>${escapeHTML(result.exam_type)}</td>
                <td>${escapeHTML(result.marks_obtained)}</td>
                <td>${escapeHTML(result.total_marks)}</td>
                <td>${escapeHTML(result.academic_year || "-")}</td>
            </tr>
        `;

    }).join("");

}

// =========================================
// RENDER EXTERNAL RESULTS
// =========================================

function renderExternalResults(results) {

    const tbody = document.getElementById("externalResultsBody");

    if (!results.length) {

        tbody.innerHTML = `
            <tr>
                <td colspan="5">No published external results available.</td>
            </tr>
        `;

        return;
    }

    tbody.innerHTML = results.map(result => {

        const viewURL =
            `${API_URL}/student/view-external.php?id=${encodeURIComponent(result.id)}`;

        return `
            <tr>
                <td>Semester ${escapeHTML(result.semester)}</td>
                <td>${escapeHTML(result.academic_year || "-")}</td>
                <td>${escapeHTML(result.original_filename || "Result PDF")}</td>
                <td>${formatDate(result.created_at)}</td>
                <td>
                    <a
                        href="${viewURL}"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="view-result-btn"
                    >
                        View PDF
                    </a>
                </td>
            </tr>
        `;

    }).join("");

}

// =========================================
// SEMESTER FILTER
// =========================================

function filterResults() {

    const semester = document.getElementById("semesterFilter").value;

    const filteredInternal = semester === "all"
        ? allInternalResults
        : allInternalResults.filter(
            result => Number(result.semester) === Number(semester)
        );

    const filteredExternal = semester === "all"
        ? allExternalResults
        : allExternalResults.filter(
            result => Number(result.semester) === Number(semester)
        );

    renderInternalResults(filteredInternal);
    renderExternalResults(filteredExternal);

}

// =========================================
// SAFE HTML
// =========================================

function escapeHTML(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}

// =========================================
// FORMAT DATE
// =========================================

function formatDate(dateValue) {

    if (!dateValue) {
        return "-";
    }

    const date = new Date(dateValue.replace(" ", "T"));

    if (isNaN(date.getTime())) {
        return "-";
    }

    return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });

}
