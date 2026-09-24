const loginForm = document.querySelector(".login-form");

loginForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const course = document.getElementById("course").value;

    // Course not selected
    if (course === "") {
        alert("Please select your course.");
        return;
    }

    // Save selected course
    localStorage.setItem("studentCourse", course);

    // Go to dashboard
    window.location.href = "Pages/dashboard.html";
});