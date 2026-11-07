
const API_URL = "http://localhost/apollo-backend";
const LOGIN_URL = "http://localhost/apollo-attandance/index.html";

let internalResults = [];
let externalResults = [];
let currentSemester = 0;
let activeTab = "internal";


// ========================================
// COMMON PARENT API REQUEST
// ========================================

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
// 1. LOAD PARENT AND STUDENT DETAILS
// ========================================

async function loadStudentDetails() {

    try {

        const data = await fetchParentData("/parent/profile.php");

        if (data.status !== "success") {
            throw new Error(data.message || "Unable to load profile.");
        }

        const profile = data.profile;

        document.getElementById("studentName").textContent =
            profile.student_name || "Student";

        document.getElementById("rollNo").textContent =
            profile.roll_no || "—";

        const parentInitial = document.getElementById("parentInitial");
        const parentPhoto = document.getElementById("parentPhoto");

        if (parentInitial && parentPhoto) {
            parentInitial.textContent =
                (profile.parent_name || "P").charAt(0).toUpperCase();

            function showInitial() {
                parentPhoto.hidden = true;
                parentInitial.style.display = "flex";
            }

            if (profile.profile_photo) {
                const photoPath = profile.profile_photo.replace(/\\/g, "/");

                const photoURL = photoPath.startsWith("http")
                    ? photoPath
                    : `${API_URL}/${photoPath.replace(/^\/+/, "")}`;

                parentPhoto.onload = function () {
                    parentPhoto.hidden = false;
                    parentInitial.style.display = "none";
                };

                parentPhoto.onerror = showInitial;
                parentPhoto.src = photoURL + "?t=" + Date.now();
            } else {
                showInitial();
            }
        }

    } catch (error) {
        console.error("Student details error:", error);
    }
}


// ========================================
// 2. LOAD INTERNAL AND EXTERNAL RESULTS
// ========================================

async function loadResults() {

    const internalMessage =
        document.getElementById("internalMessage");

    const externalMessage =
        document.getElementById("externalMessage");

    internalMessage.textContent = "Loading internal results...";
    externalMessage.textContent = "Loading external results...";

    try {

        const [internalData, externalData] = await Promise.all([

            fetchParentData("/results/get-internal.php"),

            fetchParentData("/results/get-external.php")

        ]);

        if (internalData.status !== "success") {
            throw new Error(
                internalData.message || "Unable to load internal results."
            );
        }

        if (externalData.status !== "success") {
            throw new Error(
                externalData.message || "Unable to load external results."
            );
        }

        internalResults = internalData.results || [];
        externalResults = externalData.results || [];

        currentSemester = Math.max(
            Number(internalData.current_semester) || 0,
            Number(externalData.current_semester) || 0
        );

        if (currentSemester < 1) {
            throw new Error("Student semester information is unavailable.");
        }

        populateSemesterFilter();

        // Default to the student's current semester.
        document.getElementById("semesterFilter").value =
            String(currentSemester);

        renderResults();

    } catch (error) {

        console.error("Results loading error:", error);

        internalMessage.textContent = error.message;
        externalMessage.textContent = error.message;
    }
}


// ========================================
// 3. POPULATE SEMESTER FILTER
// ========================================

function populateSemesterFilter() {

    const filter = document.getElementById("semesterFilter");

    filter.replaceChildren();

    for (let semester = 1; semester <= currentSemester; semester++) {

        const option = document.createElement("option");

        option.value = semester;
        option.textContent = `Semester ${semester}`;

        filter.appendChild(option);
    }
}


// ========================================
// 4. RENDER CURRENT TAB RESULTS
// ========================================

function renderResults() {

    const semester = Number(
        document.getElementById("semesterFilter").value
    );

    if (!semester) return;

    if (activeTab === "internal") {
        displayInternalResults(semester);
    } else {
        displayExternalResults(semester);
    }
}


// ========================================
// 5. DISPLAY INTERNAL RESULTS
// ========================================

function displayInternalResults(semester) {

    const message =
        document.getElementById("internalMessage");

    const table =
        document.getElementById("internalResultsTable");

    table.replaceChildren();

    const filteredResults = internalResults.filter(
        result => Number(result.semester) === semester
    );

    if (filteredResults.length === 0) {

        message.hidden = false;
        message.textContent =
            `No published internal results available for Semester ${semester}.`;

        return;
    }

    message.hidden = true;

    filteredResults.forEach(result => {

        const row = document.createElement("tr");

        const percentage = Number(result.total_marks) > 0
            ? (
                Number(result.marks_obtained) /
                Number(result.total_marks)
            ) * 100
            : 0;

        const values = [
            result.subject_name,
            result.exam_type,
            result.marks_obtained,
            result.total_marks,
            `${percentage.toFixed(2)}%`
        ];

        values.forEach(value => {

            const cell = document.createElement("td");

            cell.textContent = value ?? "—";

            row.appendChild(cell);
        });

        table.appendChild(row);
    });
}


// ========================================
// 6. DISPLAY EXTERNAL RESULTS
// ========================================

function displayExternalResults(semester) {

    const message =
        document.getElementById("externalMessage");

    const container =
        document.getElementById("externalResultsList");

    container.replaceChildren();

    const filteredResults = externalResults.filter(
        result => Number(result.semester) === semester
    );

    if (filteredResults.length === 0) {

        message.hidden = false;
        message.textContent =
            `No published external result available for Semester ${semester}.`;

        return;
    }

    message.hidden = true;

    filteredResults.forEach(result => {

        const card = document.createElement("article");

        card.className = "external-result-card";

        const info = document.createElement("div");

        info.className = "external-result-info";

        const title = document.createElement("h3");

        title.textContent = `Semester ${result.semester} External Result`;

        const year = document.createElement("p");

        year.textContent =
            `Academic Year: ${result.academic_year}`;

        const filename = document.createElement("p");

        filename.textContent =
            `Marksheet: ${result.original_filename}`;

        info.append(title, year, filename);

        const viewButton = document.createElement("a");

        viewButton.className = "view-result-btn";

        viewButton.textContent = "View Marksheet PDF";

        // Open the secure parent-only PDF endpoint.
        const pdfPath = result.view_url;

        viewButton.href = new URL(
            pdfPath,
            `${API_URL}/results/`
        ).href;

        viewButton.target = "_blank";
        viewButton.rel = "noopener noreferrer";

        card.append(info, viewButton);

        container.appendChild(card);
    });
}


// ========================================
// 7. INTERNAL / EXTERNAL TABS
// ========================================

function switchTab(tab) {

    activeTab = tab;

    const internalTab =
        document.getElementById("internalTab");

    const externalTab =
        document.getElementById("externalTab");

    const internalSection =
        document.getElementById("internalSection");

    const externalSection =
        document.getElementById("externalSection");

    const heading =
        document.getElementById("resultHeading");

    if (tab === "internal") {

        internalTab.classList.add("active");
        externalTab.classList.remove("active");

        internalSection.hidden = false;
        externalSection.hidden = true;

        heading.textContent = "Internal Results";

    } else {

        externalTab.classList.add("active");
        internalTab.classList.remove("active");

        externalSection.hidden = false;
        internalSection.hidden = true;

        heading.textContent = "External Results";
    }

    renderResults();
}


// ========================================
// 8. LOGOUT
// ========================================

document.getElementById("logoutBtn").addEventListener(
    "click",
    async function () {

        try {

            const response = await fetch(
                `${API_URL}/auth/logout.php`,
                {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "Content-Type":
                            "application/x-www-form-urlencoded"
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

            window.location.href = LOGIN_URL;

        } catch (error) {

            console.error("Logout error:", error);

            alert("Unable to connect to the server.");
        }
    }
);


// ========================================
// 9. EVENT LISTENERS
// ========================================

document.getElementById("internalTab").addEventListener(
    "click",
    () => switchTab("internal")
);

document.getElementById("externalTab").addEventListener(
    "click",
    () => switchTab("external")
);

document.getElementById("semesterFilter").addEventListener(
    "change",
    renderResults
);


// ========================================
// 10. INITIALIZE RESULTS PAGE
// ========================================

document.addEventListener("DOMContentLoaded", function () {

    loadStudentDetails();

    loadResults();

});
