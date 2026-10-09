const API_URL = "http://localhost/apollo-backend";

let allFeedback = [];

document.addEventListener("DOMContentLoaded", function () {
    loadFeedback();

    document.getElementById("ratingFilter").addEventListener("change", function () {
        displayFeedback(this.value);
    });

    document.getElementById("logoutButton").addEventListener("click", logoutAdmin);

    document.getElementById("facultyLink").addEventListener("click", function (event) {
        event.preventDefault();
        alert("Faculty Management will be implemented next.");
    });
});

async function loadFeedback() {
    const tableBody = document.getElementById("feedbackTableBody");
    const message = document.getElementById("pageMessage");

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

        document.getElementById("adminName").textContent =
            sessionData.admin.name;

        document.getElementById("adminEmail").textContent =
            sessionData.admin.email;

        // Fetch feedback records
        const response = await fetch(
            `${API_URL}/admin/feedback.php`,
            { credentials: "include" }
        );

        if (response.status === 401) {
            window.location.href = "admin-login.html";
            return;
        }

        const data = await response.json();

        if (!response.ok || !data.success || !Array.isArray(data.feedback)) {
            throw new Error(data.message || "Could not load student feedback.");
        }

        allFeedback = data.feedback;

        document.getElementById("feedbackCount").textContent =
            allFeedback.length;

        displayFeedback(document.getElementById("ratingFilter").value);

        message.textContent = allFeedback.length
            ? ""
            : "No student feedback has been submitted yet.";

    } catch (error) {
        console.error("Feedback Loading Error:", error);

        tableBody.replaceChildren();

        const row = document.createElement("tr");
        const cell = document.createElement("td");

        cell.colSpan = 6;
        cell.textContent = "Unable to load feedback.";

        row.appendChild(cell);
        tableBody.appendChild(row);

        message.textContent =
            error.message || "Check XAMPP and the backend API.";
        message.style.color = "#dc2626";
    }
}

function displayFeedback(rating) {
    const tableBody = document.getElementById("feedbackTableBody");

    const filteredFeedback = allFeedback.filter(function (item) {
        return rating === "all" || String(item.rating) === rating;
    });

    tableBody.replaceChildren();

    if (filteredFeedback.length === 0) {
        const row = document.createElement("tr");
        const cell = document.createElement("td");

        cell.colSpan = 6;
        cell.textContent = "No feedback found for this rating.";

        row.appendChild(cell);
        tableBody.appendChild(row);
        return;
    }

    filteredFeedback.forEach(function (item) {
        const row = document.createElement("tr");

        const values = [
            item.id,
            item.student_name || "Unknown student",
            item.roll_no || "—"
        ];

        values.forEach(function (value) {
            const cell = document.createElement("td");
            cell.textContent = value;
            row.appendChild(cell);
        });

        // Display star rating
        const ratingCell = document.createElement("td");
        const stars = Math.max(0, Math.min(5, Number(item.rating) || 0));

        ratingCell.textContent =
            "★".repeat(stars) + "☆".repeat(5 - stars);

        ratingCell.className = "feedback-rating";
        ratingCell.title = `${stars} out of 5 stars`;

        row.appendChild(ratingCell);

        // Display feedback safely as text
        const feedbackCell = document.createElement("td");
        feedbackCell.textContent = item.feedback || "No comment provided.";
        row.appendChild(feedbackCell);

        // Display submission date
        const dateCell = document.createElement("td");

        if (item.created_at) {
            const date = new Date(item.created_at.replace(" ", "T"));

            dateCell.textContent = Number.isNaN(date.getTime())
                ? item.created_at
                : date.toLocaleString();
        } else {
            dateCell.textContent = "—";
        }

        row.appendChild(dateCell);
        tableBody.appendChild(row);
    });
}

async function logoutAdmin() {
    try {
        const response = await fetch(`${API_URL}/admin/logout.php`, {
            method: "POST",
            credentials: "include"
        });

        if (!response.ok) {
            throw new Error("Logout failed.");
        }

        window.location.href = "admin-login.html";

    } catch (error) {
        console.error("Logout Error:", error);
        alert("Unable to log out. Please check the server.");
    }
}