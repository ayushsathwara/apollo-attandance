document.addEventListener(
    "DOMContentLoaded",
    function () {

        const form =
            document.getElementById(
                "studentForm"
            );


        form.addEventListener(
            "submit",
            addStudent
        );

    }
);


async function addStudent(event) {

    event.preventDefault();


    const name =
        document.getElementById(
            "name"
        ).value.trim();


    const rollNo =
        document.getElementById(
            "rollNo"
        ).value.trim();


    const email =
        document.getElementById(
            "email"
        ).value.trim();


    const password =
        document.getElementById(
            "password"
        ).value;


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
        password === "" ||
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
                "http://localhost/apollo-backend/faculty/add_student.php",
                {
                    method: "POST",

                    credentials: "include",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        name: name,

                        roll_no: rollNo,

                        email: email,

                        password: password,

                        course: course,

                        semester: semester

                    })
                }
            );


        const data =
            await response.json();


        console.log(
            "Add Student:",
            data
        );


        if (data.status === "success") {

            alert(
                data.message
            );


            document
                .getElementById(
                    "studentForm"
                )
                .reset();


        } else {

            alert(
                data.message ||
                "Unable to add student."
            );

        }

    }

    catch (error) {

        console.error(
            "Add Student Error:",
            error
        );

        alert(
            "Unable to connect to server."
        );

    }

}