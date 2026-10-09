const semesterButtons = document.querySelectorAll(".semester-btn");
const semesterSections = document.querySelectorAll(".semester-section");

semesterButtons.forEach(button => {

    button.addEventListener("click", function () {

        const semester = this.dataset.semester;

        semesterButtons.forEach(btn => {
            btn.classList.remove("active");
        });

        this.classList.add("active");

        semesterSections.forEach(section => {
            section.classList.remove("active");
        });

        document.getElementById(semester).classList.add("active");

    });

});