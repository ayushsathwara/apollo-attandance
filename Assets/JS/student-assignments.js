const assignmentsContainer =
    document.getElementById("assignmentsContainer");


async function loadAssignments() {

    try {

        const response = await fetch(
            "http://localhost/apollo-backend/student/assignments.php",
            {
                credentials: "include"
            }
        );

        const data = await response.json();

        if (data.status !== "success") {

            assignmentsContainer.innerHTML = `
                <div class="no-assignments">
                    ${data.message || "Unable to load assignments."}
                </div>
            `;

            return;
        }


        if (data.assignments.length === 0) {

            assignmentsContainer.innerHTML = `
                <div class="no-assignments">
                    No assignments available.
                </div>
            `;

            return;
        }


        assignmentsContainer.innerHTML = "";


        data.assignments.forEach(assignment => {

            const card = document.createElement("div");

            card.className = "assignment-card";


            let actionButton = "";


            if (assignment.status === "Pending") {

                actionButton = `
        <div class="submission-box">

            <label
                for="submissionFile-${assignment.id}"
            >
                Upload Your Assignment
            </label>

            <input
                type="file"
                id="submissionFile-${assignment.id}"
                accept=".pdf,.doc,.docx,.zip"
            >

            <button
                type="button"
                class="submit-btn"
                onclick="submitAssignment(${assignment.id})"
            >
                Upload Assignment
            </button>

        </div>
    `;

            }
            else if (assignment.status === "Submitted") {

                actionButton = `
                    <button
                        class="submit-btn"
                        onclick="viewSubmission(${assignment.id})"
                    >
                        View Submission
                    </button>
                `;

            }
            else {

                actionButton = `
                    <button
                        class="submit-btn"
                        onclick="viewSubmission(${assignment.id})"
                    >
                        View Assignment
                    </button>
                `;

            }


            card.innerHTML = `

                <div class="assignment-top">

                    <div>

                        <h3 class="assignment-title">
                            ${assignment.title}
                        </h3>

                        <p class="assignment-subject">
                            ${assignment.subject}
                        </p>

                    </div>

                    <span class="status ${assignment.status.toLowerCase()}">
                        ${assignment.status}
                    </span>

                </div>


                <div class="assignment-info">

                    <div class="info-box">

                        <span>Faculty</span>

                        <strong>
                            ${assignment.faculty_name}
                        </strong>

                    </div>


                    <div class="info-box">

                        <span>Due Date</span>

                        <strong>
                            ${formatDate(assignment.due_date)}
                        </strong>

                    </div>


                    <div class="info-box">

                        <span>Status</span>

                        <strong>
                            ${assignment.status}
                        </strong>

                    </div>

                </div>


                <p class="assignment-description">

                    ${assignment.description || "No description provided."}

                </p>


                <div class="assignment-action">

                    ${actionButton}

                </div>

            `;


            assignmentsContainer.appendChild(card);

        });


    } catch (error) {

        console.error(error);

        assignmentsContainer.innerHTML = `
            <div class="no-assignments">
                Server error. Please try again.
            </div>
        `;

    }

}


function formatDate(dateString) {

    const date = new Date(dateString);

    return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });

}


async function submitAssignment(assignmentId) {

    const fileInput =
        document.getElementById(
            `submissionFile-${assignmentId}`
        );

    if (!fileInput) {

        alert("File input not found.");

        return;
    }


    const file =
        fileInput.files[0];


    if (!file) {

        alert(
            "Please select your assignment file."
        );

        return;
    }


    /* ================================
       FILE TYPE
    ================================= */

    const allowedExtensions = [
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


    if (
        !allowedExtensions.includes(
            extension
        )
    ) {

        alert(
            "Only PDF, DOC, DOCX and ZIP files are allowed."
        );

        return;
    }


    /* ================================
       FILE SIZE
    ================================= */

    const maxSize =
        10 * 1024 * 1024;


    if (file.size > maxSize) {

        alert(
            "File size must be less than 10 MB."
        );

        return;
    }


    const confirmSubmit =
        confirm(
            "Are you sure you want to submit this assignment?"
        );


    if (!confirmSubmit) {
        return;
    }


    /* ================================
       FORM DATA
    ================================= */

    const formData =
        new FormData();


    formData.append(
        "assignment_id",
        assignmentId
    );

    formData.append(
        "submission_file",
        file
    );


    /* ================================
       SEND
    ================================= */

    try {

        const response =
            await fetch(
                "http://localhost/apollo-backend/student/submit_assignment.php",
                {
                    method: "POST",

                    credentials: "include",

                    body: formData
                }
            );


        const responseText =
            await response.text();


        console.log(
            "Submission Response:",
            responseText
        );


        const data =
            JSON.parse(responseText);


        if (data.status === "success") {

            alert(
                "Assignment submitted successfully!"
            );

            loadAssignments();

        }
        else {

            alert(
                data.message ||
                "Unable to submit assignment."
            );

        }

    }
    catch (error) {

        console.error(
            "Submission Error:",
            error
        );

        alert(
            "Server error."
        );

    }

}


function viewSubmission(assignmentId) {

    alert(
        "Submission details will be connected next."
    );

}


loadAssignments();