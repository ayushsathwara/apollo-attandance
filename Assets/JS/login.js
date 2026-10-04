const loginForm = document.querySelector(".login-form");

loginForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const email = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const course = document.getElementById("course").value;

    // Course not selected
    if (course === "") {
        alert("Please select your course.");
        return;
    }

    try {
        const response = await fetch(
            "http://localhost/apollo-backend/auth/login.php",
            {
                method: "POST",
                credentials: "include",
                body: new URLSearchParams({
                    email: email,
                    password: password,
                    course: course,
                    role: selectedRole
                })
            }
        );

        const result = await response.text();

        if (result.trim() === "Login successful!") {

            if (selectedRole === "student") {

                localStorage.setItem("studentCourse", course);

                window.location.href =
                    "http://localhost/apollo-attandance/Pages/dashboard.html";

            }

            else if (selectedRole === "faculty") {

                window.location.href =
                    "http://localhost/apollo-attandance/Pages/faculty-dashboard.html";

            }

            else if (selectedRole === "parent") {

                alert("Parent login will be added later.");

            }

        } else {
            alert(result);
        }

    } catch (error) {
        alert("Unable to connect to server.");
        console.error(error);
    }
});
let selectedRole = "student";

const roleCards = document.querySelectorAll(".role-card");

roleCards.forEach(function (card) {

    card.addEventListener("click", function () {

        roleCards.forEach(function (item) {
            item.classList.remove("active");
        });

        this.classList.add("active");

        selectedRole =
            this.getAttribute("data-role");

        console.log("Selected Role:", selectedRole);

    });

});