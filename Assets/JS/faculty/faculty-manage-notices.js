
const API_URL = "http://localhost/apollo-backend";

document.addEventListener("DOMContentLoaded", () => {
    loadManageNotices();
});

async function loadManageNotices() {
    const container = document.getElementById("noticesContainer");

    try {
        const response = await fetch(
            `${API_URL}/faculty/manage-notices.php`,
            {
                credentials: "include"
            }
        );

        const data = await response.json();

        if (!data.success) {
            container.innerHTML = `<p>${data.message || "Unable to load notices."}</p>`;
            return;
        }

        if (!data.notices || data.notices.length === 0) {
            container.innerHTML = "<p>No notices found for your course.</p>";
            return;
        }

        container.innerHTML = data.notices.map(notice => `
            <div class="notice-card">
                <div class="notice-card-header">
                    <h3>${escapeHTML(notice.title)}</h3>
                    <span class="notice-category">
                        ${escapeHTML(notice.category || "academic")}
                    </span>
                </div>

                <p>${escapeHTML(notice.message)}</p>

                <div class="notice-details">
                    <span>Audience: ${escapeHTML(notice.target_role || "all")}</span>
                    <span>Course: ${escapeHTML(notice.course || "All Courses")}</span>
                    <span>${formatDate(notice.created_at)}</span>
                </div>

                <div class="notice-actions">
                    <button onclick="editNotice(${Number(notice.id)})">
                        Edit
                    </button>

                    <button onclick="deleteNotice(${Number(notice.id)})">
                        Delete
                    </button>
                </div>
            </div>
        `).join("");

    } catch (error) {
        console.error("Manage Notices Error:", error);
        container.innerHTML = "<p>Unable to connect to the server.</p>";
    }
}

async function editNotice(id) {
    const title = prompt("Enter notice title:");
    if (title === null) return;

    const message = prompt("Enter notice message:");
    if (message === null) return;

    const targetRole = prompt(
        "Enter audience: all, student, parent or faculty"
    );
    if (targetRole === null) return;

    const category = prompt(
        "Enter category: academic, exam or event"
    );
    if (category === null) return;

    const course = prompt(
        "Enter course: BCA, MCA, BBA or all"
    );
    if (course === null) return;

    const validRoles = ["all", "student", "parent", "faculty"];
    const validCategories = ["academic", "exam", "event"];
    const validCourses = ["BCA", "MCA", "BBA", "all"];

    if (
        !title.trim() ||
        !message.trim() ||
        !validRoles.includes(targetRole.trim().toLowerCase()) ||
        !validCategories.includes(category.trim().toLowerCase()) ||
        !validCourses.includes(course.trim())
    ) {
        alert("Please enter valid notice details.");
        return;
    }

    try {
        const response = await fetch(
            `${API_URL}/faculty/edit-notice.php`,
            {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    id,
                    title: title.trim(),
                    message: message.trim(),
                    target_role: targetRole.trim().toLowerCase(),
                    category: category.trim().toLowerCase(),
                    course: course.trim()
                })
            }
        );

        const data = await response.json();

        alert(data.message || "Notice updated.");

        if (data.success) {
            loadManageNotices();
        }

    } catch (error) {
        console.error(error);
        alert("Unable to update notice.");
    }
}

async function deleteNotice(id) {
    if (!confirm("Are you sure you want to delete this notice?")) {
        return;
    }

    try {
        const response = await fetch(
            `${API_URL}/faculty/delete-notice.php`,
            {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ id })
            }
        );

        const data = await response.json();

        alert(data.message || "Notice deleted.");

        if (data.success) {
            loadManageNotices();
        }

    } catch (error) {
        console.error(error);
        alert("Unable to delete notice.");
    }
}

function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    })[character]);
}

function formatDate(value) {
    if (!value) return "";

    const date = new Date(value.replace(" ", "T"));

    return isNaN(date.getTime())
        ? escapeHTML(value)
        : date.toLocaleDateString("en-IN");
}
