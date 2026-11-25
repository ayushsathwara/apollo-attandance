
const API_URL = "http://localhost/apollo-backend";
const LOGIN_URL = "http://localhost/apollo-attandance/index.html";

let allAssignments = [];
let currentFilter = "all";

// =====================================
// LOAD PARENT PROFILE PHOTO
// =====================================

async function loadParentPhoto() {

    const parentInitial = document.getElementById("parentInitial");
    const parentPhoto = document.getElementById("parentPhoto");

    if (!parentInitial || !parentPhoto) return;

    try {
        const response = await fetch(`${API_URL}/parent/profile.php`, {
            method: "GET",
            credentials: "include"
        });

        const data = await response.json();

        if (data.status !== "success" || !data.profile) {
            throw new Error("Parent profile not available");
        }

        const profile = data.profile;

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

    } catch (error) {
        console.error("Parent photo error:", error);
        parentPhoto.hidden = true;
        parentInitial.style.display = "flex";
    }
}

// =====================================
// LOAD ASSIGNMENTS
// =====================================

async function loadParentAssignments() {

    const message = document.getElementById("assignmentsMessage");
    const list = document.getElementById("assignmentsList");

    if (!message || !list) return;

    message.textContent = "Loading assignments...";
    list.replaceChildren();

    try {

        const response = await fetch(
            `${API_URL}/parent/assignments.php`,
            {
                method: "GET",
                credentials: "include"
            }
        );

        const data = await response.json();

        if (response.status === 401) {
            window.location.href = LOGIN_URL;
            return;
        }

        if (!response.ok || data.status !== "success") {
            throw new Error(
                data.message || "Unable to load assignments."
            );
        }

        allAssignments = Array.isArray(data.assignments)
            ? data.assignments
            : [];

        // Summary counts
        const pending = allAssignments.filter(
            a => a.status === "Pending"
        ).length;

        const submitted = allAssignments.filter(
            a => a.status === "Submitted"
        ).length;

        const overdue = allAssignments.filter(
            a => a.status === "Overdue"
        ).length;

        document.getElementById("assignmentTotal").textContent =
            allAssignments.length;

        document.getElementById("assignmentPending").textContent =
            pending;

        document.getElementById("assignmentSubmitted").textContent =
            submitted;

        document.getElementById("assignmentOverdue").textContent =
            overdue;

        // Show all assignments initially
        currentFilter = "all";
        updateFilterButtons();
        displayAssignments();

    } catch (error) {

        console.error("Parent assignments error:", error);
        message.textContent = error.message;
        list.replaceChildren();
    }
}


// =====================================
// DISPLAY FILTERED ASSIGNMENTS
// =====================================

function displayAssignments() {

    const list = document.getElementById("assignmentsList");
    const message = document.getElementById("assignmentsMessage");

    list.replaceChildren();

    const filteredAssignments = currentFilter === "all"
        ? allAssignments
        : allAssignments.filter(assignment =>
            String(assignment.status || "").toLowerCase() === currentFilter
        );

    if (allAssignments.length === 0) {
        message.textContent = "No assignments found for your child yet.";
        return;
    }

    if (filteredAssignments.length === 0) {
        message.textContent =
            `No ${currentFilter} assignments found.`;
        return;
    }

    message.textContent =
        `Showing ${filteredAssignments.length} ${currentFilter === "all" ? "" : currentFilter} assignment(s).`;

    filteredAssignments.forEach(assignment => {

        const card = document.createElement("article");
        card.className = "assignment-card";

        const title = document.createElement("h3");
        title.textContent =
            assignment.title || "Untitled Assignment";

        const subject = document.createElement("p");
        subject.textContent =
            `Subject: ${assignment.subject || "N/A"}`;

        const dueDate = document.createElement("p");
        dueDate.textContent =
            `Due date: ${assignment.due_date || "Not specified"}`;

        const status = document.createElement("span");
        const statusText = assignment.status || "Pending";

        status.className =
            `assignment-status ${statusText.toLowerCase()}`;

        status.textContent = statusText;

        card.append(title, subject, dueDate);

        if (assignment.description) {
            const description = document.createElement("p");
            description.textContent = assignment.description;
            card.appendChild(description);
        }

        card.appendChild(status);

        if (assignment.assignment_file_path) {

            const fileLink = document.createElement("a");

            const filePath =
                assignment.assignment_file_path.replace(/^\/+/, "");

            fileLink.href = `${API_URL}/${filePath}`;
            fileLink.textContent = "📄 View Assignment File";
            fileLink.target = "_blank";
            fileLink.rel = "noopener noreferrer";

            card.appendChild(fileLink);
        }

        list.appendChild(card);
    });
}


// =====================================
// FILTER BUTTON EVENTS
// =====================================

document.querySelectorAll(".filter-btn").forEach(button => {

    button.addEventListener("click", () => {

        currentFilter = button.dataset.filter;

        updateFilterButtons();
        displayAssignments();

    });

});

function updateFilterButtons() {

    document.querySelectorAll(".filter-btn").forEach(button => {

        button.classList.toggle(
            "active",
            button.dataset.filter === currentFilter
        );

    });
}


// =====================================
// LOGOUT
// =====================================

document.getElementById("logoutBtn")?.addEventListener(
    "click",
    async () => {

        try {

            await fetch(`${API_URL}/auth/logout.php`, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    role: "parent"
                })
            });

        } catch (error) {
            console.error("Logout error:", error);
        }

        window.location.href = LOGIN_URL;
    }
);


// =====================================
// INITIALIZE
// =====================================

loadParentAssignments();
loadParentPhoto();