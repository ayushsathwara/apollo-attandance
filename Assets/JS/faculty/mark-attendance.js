document.addEventListener("DOMContentLoaded", function () {

    loadSubjects();

    loadStudents();

});
async function loadSubjects() {

    const subjectSelect =
        document.getElementById("subject");

    try {

        const response = await fetch(
            "http://localhost/apollo-backend/faculty/subjects.php",
            {
                credentials: "include"
            }
        );

        const data =
            await response.json();

        console.log(
            "Faculty Subjects:",
            data
        );


        if (data.status !== "success") {

            alert(
                data.message ||
                "Unable to load subjects."
            );

            return;
        }


        subjectSelect.innerHTML = `
            <option value="">
                Select Subject
            </option>
        `;


        data.subjects.forEach(
            function (subject) {

                const option =
                    document.createElement("option");

                option.value = subject;

                option.textContent = subject;

                subjectSelect.appendChild(
                    option
                );

            }
        );

    }

    catch (error) {

        console.error(
            "Subjects Error:",
            error
        );

        alert(
            "Unable to load subjects."
        );

    }

}


async function loadStudents() {

    try {

        const response = await fetch(
            "http://localhost/apollo-backend/faculty/students.php",
            {
                credentials: "include"
            }
        );

        const data = await response.json();

        console.log("Students Data:", data);


        if (data.status !== "success") {

            alert(data.message || "Unable to load students.");

            return;
        }


        showStudents(data.students);


    } catch (error) {

        console.error("Students Error:", error);

        alert("Unable to connect to server.");

    }

}


function showStudents(students) {

    const studentList =
        document.getElementById("studentList");

    const studentCount =
        document.getElementById("studentCount");


    studentCount.textContent =
        students.length + " Students";


    if (students.length === 0) {

        studentList.innerHTML =
            `<p class="empty-message">
                No students found.
            </p>`;

        return;
    }


    studentList.innerHTML = "";


    students.forEach(function (student) {

        const firstLetter =
            student.name.charAt(0).toUpperCase();


        const row =
            document.createElement("div");

        row.className = "student-row";


        row.innerHTML = `

            <div class="student-info">

                <div class="student-avatar">
                    ${firstLetter}
                </div>

                <div>

                    <h3>
                        ${student.name}
                    </h3>

                    <p>
                        Roll No: ${student.roll_no}
                    </p>

                </div>

            </div>


            <div class="attendance-buttons">

                <button
                    type="button"
                    class="present-btn"
                    data-student-id="${student.id}"
                    data-status="Present">

                    Present

                </button>


                <button
                    type="button"
                    class="absent-btn"
                    data-student-id="${student.id}"
                    data-status="Absent">

                    Absent

                </button>

            </div>

        `;


        studentList.appendChild(row);

    });


    setupAttendanceButtons();

}


function setupAttendanceButtons() {

    const buttons =
        document.querySelectorAll(
            ".attendance-buttons button"
        );


    buttons.forEach(function (button) {

        button.addEventListener("click", function () {

            const studentId =
                this.getAttribute("data-student-id");


            const row =
                this.closest(".student-row");


            const rowButtons =
                row.querySelectorAll(
                    ".attendance-buttons button"
                );


            rowButtons.forEach(function (item) {

                item.classList.remove("active");

            });


            this.classList.add("active");


            console.log(
                "Student:",
                studentId,
                "Status:",
                this.getAttribute("data-status")
            );

        });

    });

}
async function saveAttendance() {

    const subject =
        document.getElementById("subject").value;

    const attendanceDate =
        document.getElementById("attendanceDate").value;


    if (subject === "") {

        alert("Please select a subject.");

        return;
    }


    if (attendanceDate === "") {

        alert("Please select a date.");

        return;
    }


    const selectedButtons =
        document.querySelectorAll(
            ".attendance-buttons button.active"
        );


    if (selectedButtons.length === 0) {

        alert("Please mark attendance for at least one student.");

        return;
    }


    const attendance = [];


    selectedButtons.forEach(function (button) {

        attendance.push({

            student_id:
                button.getAttribute("data-student-id"),

            status:
                button.getAttribute("data-status")

        });

    });


    try {

        const response = await fetch(
            "http://localhost/apollo-backend/faculty/save_attendance.php",
            {

                method: "POST",

                credentials: "include",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({

                    subject: subject,

                    attendance_date:
                        attendanceDate,

                    attendance: attendance

                })

            }
        );


        const data =
            await response.json();


        console.log(
            "Save Attendance:",
            data
        );


        if (data.status === "success") {

            alert(data.message);

            location.reload();

        } else {

            alert(
                data.message ||
                "Unable to save attendance."
            );

        }


    } catch (error) {

        console.error(
            "Save Attendance Error:",
            error
        );

        alert("Unable to connect to server.");

    }

}
const saveButton =
    document.getElementById("saveAttendance");

if (saveButton) {

    saveButton.addEventListener(
        "click",
        saveAttendance
    );

}