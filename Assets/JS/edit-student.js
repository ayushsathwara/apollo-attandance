document.addEventListener(
    "DOMContentLoaded",
    function () {

        loadStudent();

        const form =
            document.getElementById(
                "editStudentForm"
            );

        form.addEventListener(
            "submit",
            function (event) {

                event.preventDefault();

                updateStudent();

            }
        );

    }
);


/* =========================
   LOAD STUDENT
========================= */

async function loadStudent() {

    const params =
        new URLSearchParams(
            window.location.search
        );

    const studentId =
        params.get("id");


    if (!studentId) {

        alert(
            "Student ID not found."
        );

        window.location.href =
            "students.html";

        return;
    }


    try {

        const response =
            await fetch(
                "http://localhost/apollo-backend/faculty/students.php",
                {
                    credentials: "include"
                }
            );


        const data =
            await response.json();


        if (data.status !== "success") {

            alert(
                data.message ||
                "Unable to load student."
            );

            return;
        }


        const student =
            data.students.find(
                function (item) {

                    return (
                        item.id == studentId
                    );

                }
            );


        if (!student) {

            alert(
                "Student not found."
            );

            window.location.href =
                "students.html";

            return;
        }


        document.getElementById(
            "name"
        ).value = student.name;


        document.getElementById(
            "roll_no"
        ).value = student.roll_no;


        document.getElementById(
            "email"
        ).value = student.email;


        document.getElementById(
            "course"
        ).value = student.course;


        document.getElementById(
            "semester"
        ).value = student.semester;

    }

    catch (error) {

        console.error(
            "Load Student Error:",
            error
        );

        alert(
            "Unable to connect to server."
        );

    }

}


/* =========================
   UPDATE STUDENT
========================= */

async function updateStudent() {

    const params =
        new URLSearchParams(
            window.location.search
        );


    const studentId =
        params.get("id");


    const name =
        document.getElementById(
            "name"
        ).value.trim();


    const rollNo =
        document.getElementById(
            "roll_no"
        ).value.trim();


    const email =
        document.getElementById(
            "email"
        ).value.trim();


    const course =
        document.getElementById(
            "course"
        ).value;


    const semester =
        document.getElementById(
            "semester"
        ).value;


    if (
        name === "" ||
        rollNo === "" ||
        email === "" ||
        course === "" ||
        semester === ""
    ) {

        alert(
            "Please fill all fields."
        );

        return;
    }


    try {

        const response =
            await fetch(
                "http://localhost/apollo-backend/faculty/update_student.php",
                {
                    method: "POST",

                    credentials: "include",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        id: studentId,

                        name: name,

                        roll_no: rollNo,

                        email: email,

                        course: course,

                        semester: semester

                    })
                }
            );


        const data =
            await response.json();


        console.log(
            "Update Student:",
            data
        );


        if (data.status === "success") {

            alert(
                "Student updated successfully!"
            );

            window.location.href =
                "students.html";

        }

        else {

            alert(
                data.message ||
                "Unable to update student."
            );

        }

    }

    catch (error) {

        console.error(
            "Update Student Error:",
            error
        );

        alert(
            "Unable to connect to server."
        );

    }

}