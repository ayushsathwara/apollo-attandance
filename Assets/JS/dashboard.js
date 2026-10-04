/* ================================
   SEARCH
================================ */

const searchInput = document.getElementById("searchInput");

searchInput.addEventListener("input", function () {

    const searchValue = this.value.toLowerCase();

    document.querySelectorAll(".menu-item").forEach(function (item) {

        if (
            item.textContent
                .toLowerCase()
                .includes(searchValue)
        ) {

            item.style.opacity = "1";

        } else {

            item.style.opacity = "0.45";

        }

    });

});


/* ================================
   SIDEBAR MENU
================================ */

/*const menuItems = document.querySelectorAll(".menu-item");

menuItems.forEach(function (item) {

    item.addEventListener("click", function (event) {

        event.preventDefault();

        menuItems.forEach(function (menu) {

            menu.classList.remove("active");

        });

        this.classList.add("active");

    });

});*/


/* ================================
   NOTIFICATION
================================ */

const notificationBtn =
    document.getElementById("notificationBtn");

notificationBtn.addEventListener("click", function () {

    alert("You have 3 new notifications.");

});


/* ================================
   LOGOUT
================================ */

const logoutBtn = document.getElementById("logoutBtn");

if (logoutBtn) {
    logoutBtn.addEventListener("click", async function () {

        try {
            const response = await fetch(
                "http://localhost/apollo-backend/auth/logout.php"
            );

            const result = await response.text();

            console.log("Logout:", result);

            localStorage.removeItem("studentCourse");

            window.location.href =
                "http://localhost/apollo-attandance/index.html";

        } catch (error) {

            console.error("Logout Error:", error);
            alert("Unable to logout.");

        }

    });
}