const subjectSelect =
    document.getElementById("subject");

const addClassForm =
    document.getElementById("addClassForm");


/* ================================
   LOAD FACULTY SUBJECTS
================================ */

async function loadSubjects() {

    try {

        const response = await fetch(
            "http://localhost/apollo-backend/faculty/subjects.php",
            {
                credentials: "include"
            }
        );

        const data =
            await response.json();


        if (data.status !== "success") {

            alert(
                data.message ||
                "Unable to load subjects."
            );

            return;
        }


        subjectSelect.innerHTML =
            '<option value="">Select Subject</option>';


        data.subjects.forEach(function (subject) {

            const option =
                document.createElement("option");

            option.value = subject;

            option.textContent = subject;

            subjectSelect.appendChild(option);

        });

    }
    catch (error) {

        console.error(
            "Subject Error:",
            error
        );

        subjectSelect.innerHTML =
            '<option value="">Unable to load subjects</option>';

    }

}


/* ================================
   SAVE CLASS
================================ */

addClassForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        const startTime =
            document.getElementById("startTime").value;

        const endTime =
            document.getElementById("endTime").value;

        const subject =
            document.getElementById("subject").value;

        const room =
            document.getElementById("room").value.trim();


        try {

            const response = await fetch(
                "http://localhost/apollo-backend/faculty/add_class.php",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    credentials: "include",

                    body: JSON.stringify({

                        start_time: startTime,

                        end_time: endTime,

                        subject: subject,

                        room: room

                    })

                }
            );


            const data =
                await response.json();


            if (data.status !== "success") {

                alert(
                    data.message ||
                    "Unable to add class."
                );

                return;
            }


            alert(
                "Today's class added successfully!"
            );


            addClassForm.reset();

        }
        catch (error) {

            console.error(
                "Add Class Error:",
                error
            );

            alert(
                "Unable to connect to server."
            );

        }

    }
);


/* Load subjects */

loadSubjects();