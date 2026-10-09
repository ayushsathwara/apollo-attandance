const subjectSelect =
    document.getElementById("subject");

const assignmentForm =
    document.getElementById("assignmentForm");


/* ================================
   LOAD SUBJECTS
================================ */

async function loadSubjects() {

    try {

        const response = await fetch(
            "http://localhost/apollo-backend/faculty/subjects.php",
            {
                credentials: "include"
            }
        );

        const responseText =
            await response.text();

        console.log(
            "Subjects Response:",
            responseText
        );

        const data =
            JSON.parse(responseText);

        if (data.status !== "success") {

            alert(
                data.message ||
                "Unable to load subjects."
            );

            return;
        }

        subjectSelect.innerHTML =
            `<option value="">Select Subject</option>`;

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
            "Load Subjects Error:",
            error
        );

        alert(
            "Unable to load subjects."
        );

    }

}


/* ================================
   ADD ASSIGNMENT
================================ */

assignmentForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        const subject =
            subjectSelect.value;

        const title =
            document.getElementById("title")
                .value
                .trim();

        const description =
            document.getElementById("description")
                .value
                .trim();

        const dueDate =
            document.getElementById("dueDate")
                .value;

        const fileInput =
            document.getElementById(
                "assignmentFile"
            );


        const file =
            fileInput.files[0];


        /* ================================
           VALIDATION
        ================================ */

        if (
            !subject ||
            !title ||
            !dueDate
        ) {

            alert(
                "Please fill all required fields."
            );

            return;
        }


        if (!file) {

            alert(
                "Please select an assignment file."
            );

            return;
        }


        /* ================================
           CHECK FILE TYPE
        ================================ */

        const allowedTypes = [
            "pdf",
            "doc",
            "docx",
            "zip"
        ];

        const extension =
            file.name
                .split(".")
                .pop()
                .toLowerCase();


        if (!allowedTypes.includes(extension)) {

            alert(
                "Only PDF, DOC, DOCX and ZIP files are allowed."
            );

            return;
        }


        /* ================================
           CHECK FILE SIZE
        ================================ */

        const maxSize =
            10 * 1024 * 1024;


        if (file.size > maxSize) {

            alert(
                "File size must be less than 10 MB."
            );

            return;
        }


        /* ================================
           FORM DATA
        ================================ */

        const formData =
            new FormData();


        formData.append(
            "subject",
            subject
        );

        formData.append(
            "title",
            title
        );

        formData.append(
            "description",
            description
        );

        formData.append(
            "due_date",
            dueDate
        );

        formData.append(
            "assignment_file",
            file
        );


        /* ================================
           SEND TO PHP
        ================================ */

        try {

            const response =
                await fetch(
                    "http://localhost/apollo-backend/faculty/add_assignment.php",
                    {
                        method: "POST",

                        credentials: "include",

                        body: formData
                    }
                );


            const responseText =
                await response.text();


            console.log(
                "Add Assignment Response:",
                responseText
            );


            const data =
                JSON.parse(responseText);


            if (data.status === "success") {

                alert(
                    "Assignment added successfully!"
                );

                assignmentForm.reset();

            }
            else {

                alert(
                    data.message ||
                    "Unable to add assignment."
                );

            }

        }
        catch (error) {

            console.error(
                "Add Assignment Error:",
                error
            );

            alert(
                "Server error."
            );

        }

    }
);


/* ================================
   START
================================ */

loadSubjects();