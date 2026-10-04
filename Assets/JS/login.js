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
                body: new URLSearchParams({
                    email: email,
                    password: password,
                    course: course
                })
            }
        );

        const result = await response.text();

        if (result === "Login successful!") {

            // Save selected course
            localStorage.setItem("studentCourse", course);

            // Go to dashboard
            window.location.href = "http://localhost/apollo-attandance/Pages/dashboard.html";

        } else {
            alert(result);
        }

    } catch (error) {
        alert("Unable to connect to server.");
        console.error(error);
    }
});