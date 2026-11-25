
const API_URL = "http://localhost/apollo-backend";

const facultyTableBody = document.getElementById("facultyTableBody");
const facultyCount = document.getElementById("facultyCount");
const searchFaculty = document.getElementById("searchFaculty");
const pageMessage = document.getElementById("pageMessage");

let facultyList = [];

document.addEventListener("DOMContentLoaded", loadFaculty);

async function loadFaculty() {
    try {
        // Verify admin session
        const sessionResponse = await fetch(
            `${API_URL}/admin/check_session.php`,
            { credentials: "include" }
        );

        const sessionData = await sessionResponse.json();

        if (!sessionResponse.ok || !sessionData.success) {
            window.location.href = "admin-login.html";
            return;
        }

        // Display admin information
        document.getElementById("adminName").textContent =
            sessionData.admin?.name || sessionData.name || "Admin";

        document.getElementById("adminEmail").textContent =
            sessionData.admin?.email || sessionData.email || "";

        // Fetch faculty members
        const response = await fetch(`${API_URL}/admin/faculty.php`, {
            credentials: "include"
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(data.message || "Could not load faculty.");
        }

        facultyList = data.faculty || [];
        facultyCount.textContent = facultyList.length;

        displayFaculty(facultyList);
    } catch (error) {
        console.error("Faculty loading error:", error);
        pageMessage.textContent =
            "Could not load faculty. Check your admin session and backend.";
        facultyTableBody.innerHTML =
            '<tr><td colspan="6">Unable to load faculty members.</td></tr>';
    }
}

function displayFaculty(list) {
    facultyTableBody.replaceChildren();

    if (list.length === 0) {
        facultyTableBody.innerHTML =
            '<tr><td colspan="6">No faculty members found.</td></tr>';
        return;
    }

    list.forEach((faculty) => {
        const row = document.createElement("tr");


        const values = [
            faculty.id,
            faculty.name,
            faculty.email,
            faculty.employee_id,
            faculty.department,
            formatDate(faculty.created_at)
        ];

        values.forEach((value) => {
            const cell = document.createElement("td");
            cell.textContent = value ?? "—";
            row.appendChild(cell);
        });

        // Action column
        const actionCell = document.createElement("td");
        const deleteButton = document.createElement("button");

        deleteButton.type = "button";
        deleteButton.textContent = "Delete";
        deleteButton.className = "delete-faculty-button";

        deleteButton.addEventListener("click", () => {
            deleteFaculty(faculty.id, faculty.name);
        });

        actionCell.appendChild(deleteButton);
        row.appendChild(actionCell);

        facultyTableBody.appendChild(row);
    });
}

function formatDate(dateValue) {
    if (!dateValue) return "—";

    const date = new Date(dateValue.replace(" ", "T"));

    if (Number.isNaN(date.getTime())) return dateValue;

    return date.toLocaleString();
}

// Search faculty
searchFaculty.addEventListener("input", function () {
    const query = this.value.trim().toLowerCase();

    const filteredFaculty = facultyList.filter((faculty) => {
        return [
            faculty.id,
            faculty.name,
            faculty.email,
            faculty.employee_id,
            faculty.department
        ].some((value) =>
            String(value ?? "").toLowerCase().includes(query)
        );
    });

    displayFaculty(filteredFaculty);
});

// Logout
document.getElementById("logoutButton").addEventListener("click", async function () {
    try {
        const response = await fetch(`${API_URL}/admin/logout.php`, {
            method: "POST",
            credentials: "include"
        });

        const data = await response.json();

        if (response.ok && data.success) {
            window.location.href = "admin-login.html";
        } else {
            alert(data.message || "Logout failed. Please try again.");
        }
    } catch (error) {
        console.error("Logout error:", error);
        alert("Could not connect to the server.");
    }
});

// Existing placeholder links
document.getElementById("facultyLink")?.addEventListener("click", function (event) {
    event.preventDefault();
    window.location.href = "admin-faculty.html";
});

async function deleteFaculty(facultyId, facultyName) {
    const confirmed = confirm(
        `Are you sure you want to delete ${facultyName}?`
    );

    if (!confirmed) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/admin/delete-faculty.php`, {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                faculty_id: facultyId
            })
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(data.message || "Could not delete faculty.");
        }

        // Remove the deleted faculty from the local list
        facultyList = facultyList.filter(
            faculty => Number(faculty.id) !== Number(facultyId)
        );

        facultyCount.textContent = facultyList.length;

        // Refresh the table using the current search
        const query = searchFaculty.value.trim().toLowerCase();

        const filteredFaculty = facultyList.filter(faculty =>
            [
                faculty.id,
                faculty.name,
                faculty.email,
                faculty.employee_id,
                faculty.department
            ].some(value =>
                String(value ?? "").toLowerCase().includes(query)
            )
        );

        displayFaculty(filteredFaculty);

        pageMessage.textContent = data.message;
        pageMessage.style.color = "#15803d";

    } catch (error) {
        console.error("Delete faculty error:", error);
        pageMessage.textContent = error.message;
        pageMessage.style.color = "#dc2626";
    }
}