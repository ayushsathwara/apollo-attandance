document.addEventListener("DOMContentLoaded", function () {
    const filterButtons = document.querySelectorAll(".filter-btn");
    const noticeList = document.getElementById("noticeList");
    const noticeCount = document.getElementById("noticeCount");
    const emptyNotices = document.getElementById("emptyNotices");


    let allNotices = [];
    let currentFilter = "all";

    loadStudentName();
    loadNotices();

    // FILTER BUTTONS   
    filterButtons.forEach(function (button) {
        button.addEventListener("click", function () {
            currentFilter = button.getAttribute("data-filter");

            filterButtons.forEach(function (btn) {
                btn.classList.remove("active");
            });

            button.classList.add("active");
            renderNotices();
        });
    });

    // LOAD NOTICES FROM DATABASE
    async function loadNotices() {
        try {
            noticeList.textContent = "Loading notices...";

            const response = await fetch(
                "http://localhost/apollo-backend/student/notices.php",
                {
                    method: "GET",
                    credentials: "include"
                }
            );

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.message || "Unable to load notices.");
            }

            allNotices = data.notices || [];
            renderNotices();

        } catch (error) {
            console.error("Notices Error:", error);
            noticeList.textContent = "Unable to load notices. Please log in again and refresh.";
            noticeCount.textContent = "0";
            emptyNotices.style.display = "none";
        }
    }

    // DISPLAY AND FILTER NOTICES
    function renderNotices() {
        noticeList.replaceChildren();

        const filteredNotices = allNotices.filter(function (notice) {
            if (currentFilter === "all") {
                return true;
            }

            // Temporary category mapping based on notice title.
            return notice.category === currentFilter;
        });

        noticeCount.textContent = filteredNotices.length;
        emptyNotices.style.display =
            filteredNotices.length === 0 ? "block" : "none";

        if (filteredNotices.length === 0) {
            noticeList.replaceChildren();
            return;
        }

        filteredNotices.forEach(function (notice) {
            const card = document.createElement("article");
            card.className = "notice-card";

            // Keep your existing card design.
            card.style.display = "grid";

            const category = getNoticeCategory(notice.category);

            card.setAttribute("data-category", category.key);

            const icon = document.createElement("div");
            icon.className = "notice-icon " + category.color;
            icon.textContent = category.icon;

            const content = document.createElement("div");
            content.className = "notice-content";

            const top = document.createElement("div");
            top.className = "notice-top";

            const categoryTag = document.createElement("span");
            categoryTag.className = "notice-category " + category.tagClass;
            categoryTag.textContent = category.label;

            const date = document.createElement("span");
            date.className = "notice-date";
            date.textContent = notice.created_at
                ? new Date(
                    notice.created_at.replace(" ", "T")
                ).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric"
                })
                : "";

            top.append(categoryTag, date);

            const title = document.createElement("h2");
            title.textContent = notice.title || "Untitled Notice";

            const message = document.createElement("p");
            message.textContent = notice.message || "";

            const footer = document.createElement("div");
            footer.className = "notice-footer";

            const publisher = document.createElement("span");
            publisher.textContent = "🏫 " + (notice.posted_by || "Apollo Institute");

            const audience = document.createElement("span");
            audience.textContent = "Announcement";

            footer.append(publisher, audience);
            content.append(top, title, message, footer);
            card.append(icon, content);
            noticeList.appendChild(card);
        });
    }

    // GUESS CATEGORY FROM TITLE
    function getNoticeCategory(categoryKey) {
        if (categoryKey === "exam") {
            return {
                key: "exam",
                label: "Examination",
                color: "red",
                tagClass: "exam-tag",
                icon: "📝"
            };
        }

        if (categoryKey === "event") {
            return {
                key: "event",
                label: "Event",
                color: "purple",
                tagClass: "event-tag",
                icon: "🎉"
            };
        }

        return {
            key: "academic",
            label: "Academic",
            color: "blue",
            tagClass: "academic-tag",
            icon: "🎓"
        };
    }

});

// LOAD STUDENT NAME
async function loadStudentName() {
    try {
        const response = await fetch(
            "http://localhost/apollo-backend/student/profile.php",
            {
                credentials: "include"
            }
        );


        const data = await response.json();

        if (data.status === "success") {
            const name = data.student.name || "Student";

            document.getElementById("miniName").textContent = name;
            document.getElementById("miniAvatar").textContent =
                name.charAt(0).toUpperCase();
        }
    } catch (error) {
        console.error("Unable to load student:", error);
    }


}
