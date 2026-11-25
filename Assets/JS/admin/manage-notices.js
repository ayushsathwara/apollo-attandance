const API_URL = "http://localhost/apollo-backend";

document.addEventListener("DOMContentLoaded", function () {
    loadManageNotices();
});

async function loadManageNotices() {
    const list = document.getElementById("manageNoticesList");
    const message = document.getElementById("manageNoticeMessage");


    message.textContent = "Loading notices...";
    list.replaceChildren();

    try {
        const response = await fetch(
            `${API_URL}/faculty/manage-notices.php`,
            {
                method: "GET",
                credentials: "include"
            }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(data.message || "Unable to load notices.");
        }

        list.replaceChildren();

        if (!data.notices || data.notices.length === 0) {
            message.textContent = "No notices available.";
            return;
        }

        message.textContent = "";

        data.notices.forEach(function (notice) {
            const card = document.createElement("article");
            card.className = "manage-notice-card";

            const title = document.createElement("h2");
            title.textContent = notice.title;

            const meta = document.createElement("div");
            meta.className = "manage-notice-meta";

            const category = document.createElement("span");
            category.className = "manage-notice-tag";
            category.textContent = getCategoryLabel(notice.category);

            const audience = document.createElement("span");
            audience.textContent =
                "Audience: " + getAudienceLabel(notice.target_role);

            const date = document.createElement("span");
            date.textContent = notice.created_at
                ? new Date(notice.created_at.replace(" ", "T"))
                    .toLocaleDateString("en-IN")
                : "";

            meta.append(category, audience, date);

            const content = document.createElement("p");
            content.textContent = notice.message;

            const actions = document.createElement("div");
            actions.className = "manage-notice-actions";

            const editButton = document.createElement("button");
            editButton.type = "button";
            editButton.className = "edit-notice-btn";
            editButton.textContent = "Edit";
            editButton.addEventListener("click", function () {
                editNotice(notice);
            });

            const deleteButton = document.createElement("button");
            deleteButton.type = "button";
            deleteButton.className = "delete-notice-btn";
            deleteButton.textContent = "Delete";
            deleteButton.addEventListener("click", function () {
                deleteNotice(notice.id);
            });

            actions.append(editButton, deleteButton);
            card.append(title, meta, content, actions);
            list.appendChild(card);
        });
    } catch (error) {
        console.error("Manage Notices Error:", error);
        message.textContent = error.message || "Unable to load notices.";
    }


}

function getCategoryLabel(category) {
    const labels = {
        academic: "Academic",
        exam: "Exams",
        event: "Events"
    };


    return labels[category] || "Academic";


}

function getAudienceLabel(role) {
    const labels = {
        all: "Everyone",
        student: "Students",
        parent: "Parents",
        faculty: "Faculty"
    };


    return labels[role] || role;


}

async function editNotice(notice) {
    const title = prompt("Edit notice title:", notice.title);
    if (title === null) return;


    const message = prompt("Edit notice message:", notice.message);
    if (message === null) return;

    const targetRole = prompt(
        "Target audience: all, student, parent, faculty",
        notice.target_role
    );
    if (targetRole === null) return;

    const category = prompt(
        "Category: academic, exam, event",
        notice.category
    );
    if (category === null) return;

    const payload = {
        id: notice.id,
        title: title.trim(),
        message: message.trim(),
        target_role: targetRole.trim().toLowerCase(),
        category: category.trim().toLowerCase()
    };

    try {
        const response = await fetch(`${API_URL}/faculty/edit-notice.php`, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(data.message || "Unable to edit notice.");
        }

        alert("Notice updated successfully!");
        loadManageNotices();
    } catch (error) {
        alert(error.message || "Unable to edit notice.");
    }

}

async function deleteNotice(id) {
    if (!confirm("Are you sure you want to delete this notice?")) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/faculty/delete-notice.php`, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: id })
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(data.message || "Unable to delete notice.");
        }

        alert("Notice deleted successfully!");
        loadManageNotices();
    } catch (error) {
        alert(error.message || "Unable to delete notice.");
    }

}
