document.addEventListener("DOMContentLoaded", function () {

    loadStudents();

    const searchInput =
        document.getElementById("searchStudent");

    if (searchInput) {

        searchInput.addEventListener(
            "input",
            function () {

                searchStudents(this.value);

            }
        );

    }

});


let allStudents = [];


/* =========================
   LOAD STUDENTS
========================= */

async function loadStudents() {

    try {

        const response = await fetch(
            "http://localhost/apollo-backend/faculty/students.php",
            {
                credentials: "include"
            }
        );


        const data = await response.json();

        console.log("Students:", data);


        if (data.status !== "success") {

            alert(
                data.message ||
                "Unable to load students."
            );

            return;
        }


        allStudents = data.students || [];

        showStudents(allStudents);

    }

    catch (error) {

        console.error(
            "Students Error:",
            error
        );

        alert(
            "Unable to connect to server."
        );

    }

}


/* =========================
   SHOW STUDENTS
========================= */

function showStudents(students) {

    const table =
        document.getElementById("studentTable");

    const count =
        document.getElementById("studentCount");


    count.textContent =
        students.length + " Students";


    if (students.length === 0) {

        table.innerHTML = `
            <tr>
                <td colspan="7">
                    No students found.
                </td>
            </tr>
        `;

        return;
    }


    table.innerHTML = "";


    students.forEach(function (student, index) {

        const row =
            document.createElement("tr");


        row.innerHTML = `

            <td>
                ${index + 1}
            </td>

            <td>
                ${student.name}
            </td>

            <td>
                ${student.roll_no}
            </td>

            <td>
                ${student.email}
            </td>

            <td>
                ${student.course}
            </td>

            <td>
                ${student.semester}
            </td>

            <td class="actions">

                <button
                    class="edit-btn"
                    onclick="editStudent(${student.id})">
                    ✏️ Edit
                </button>

                <button
                    class="delete-btn"
                    onclick="deleteStudent(${student.id})">
                    🗑️ Delete
                </button>

            </td>

        `;


        table.appendChild(row);

    });

}


/* =========================
   SEARCH
========================= */

function searchStudents(searchText) {

    const search =
        searchText
            .toLowerCase()
            .trim();


    const filteredStudents =
        allStudents.filter(function (student) {

            return (

                student.name
                    .toLowerCase()
                    .includes(search)

                ||

                student.roll_no
                    .toLowerCase()
                    .includes(search)

                ||

                student.email
                    .toLowerCase()
                    .includes(search)

            );

        });


    showStudents(filteredStudents);

}


/* =========================
   EDIT
========================= */

function editStudent(studentId) {

    window.location.href =
        "edit-student.html?id=" +
        studentId;

}


/* =========================
   DELETE
========================= */

async function deleteStudent(studentId) {

    const student =
        allStudents.find(function (item) {

            return item.id == studentId;

        });


    if (!student) {

        alert("Student not found.");

        return;
    }


    const confirmDelete =
        confirm(
            "Are you sure you want to delete " +
            student.name +
            "?"
        );


    if (!confirmDelete) {
        return;
    }


    try {

        const response =
            await fetch(
                "http://localhost/apollo-backend/faculty/delete_student.php",
                {
                    method: "POST",

                    credentials: "include",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        id: studentId
                    })
                }
            );


        const data =
            await response.json();


        console.log(
            "Delete Student:",
            data
        );


        if (data.status === "success") {

            alert(
                "Student deleted successfully!"
            );

            loadStudents();

        }

        else {

            alert(
                data.message ||
                "Unable to delete student."
            );

        }

    }

    catch (error) {

        console.error(
            "Delete Error:",
            error
        );

        alert(
            "Unable to connect to server."
        );

    }

}