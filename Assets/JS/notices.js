document.addEventListener("DOMContentLoaded", function () {

    const filterButtons =
        document.querySelectorAll(".filter-btn");

    const noticeCards =
        document.querySelectorAll(".notice-card");

    const noticeCount =
        document.getElementById("noticeCount");

    const emptyNotices =
        document.getElementById("emptyNotices");


    // =========================
    // LOAD STUDENT NAME
    // =========================

    loadStudentName();


    // =========================
    // FILTER NOTICES
    // =========================

    filterButtons.forEach(function (button) {

        button.addEventListener("click", function () {

            const filter =
                button.getAttribute("data-filter");


            // Active button
            filterButtons.forEach(function (btn) {
                btn.classList.remove("active");
            });

            button.classList.add("active");


            let visibleCount = 0;


            noticeCards.forEach(function (card) {

                const category =
                    card.getAttribute("data-category");


                if (
                    filter === "all" ||
                    category === filter
                ) {

                    card.style.display = "grid";

                    visibleCount++;

                } else {

                    card.style.display = "none";
                }

            });


            // Update count
            noticeCount.textContent =
                visibleCount;


            // Empty message
            if (visibleCount === 0) {

                emptyNotices.style.display =
                    "block";

            } else {

                emptyNotices.style.display =
                    "none";
            }

        });

    });

});


// =========================
// LOAD STUDENT NAME
// =========================

async function loadStudentName() {

    try {

        const response = await fetch(
            "http://localhost/apollo-backend/student/profile.php"
        );

        const data = await response.json();


        if (data.status === "success") {

            const student =
                data.student;

            const name =
                student.name || "Student";

            document.getElementById(
                "miniName"
            ).textContent = name;


            document.getElementById(
                "miniAvatar"
            ).textContent =
                name.charAt(0).toUpperCase();

        }

    } catch (error) {

        console.error(
            "Unable to load student:",
            error
        );

    }

}