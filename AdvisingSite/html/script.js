/*
Name: Braeden Carlson, Lynda Ofurie, Justin Day
Date: 10/20/2025
Purpose: Advising Website Script
Filename: script.js
*/

/* -------------------- ELEMENTS -------------------- */
// Fetches all elements and assigns them values
const els = {
    classList: () => document.getElementById("classList"),
    classSearch: () => document.getElementById("classSearch"),
    toggles: () => document.querySelectorAll(".class-toggle .toggle-btn"),
    activeToggle: () => document.querySelector(".class-toggle .toggle-btn.active"),
    studentList: () => document.getElementById("studentList"),
    studentSearch: () => document.getElementById("studentSearch"),
    notes: () => document.getElementById("notepadArea"),
    overviewTable: () => document.getElementById("scheduleOverviewTable"),
    semesterInput: () => document.getElementById("semester"),
    saveBtn: () => document.getElementById("saveBtn"),
    addSemesterBtn: () => document.getElementById("addSemesterBtn")
};

let loadedClasses = [];
let emphasisList = []; // stores all emphases for the student

/* -------------------- INITIALIZATION-------------------- */
// Initiates some functions on load
document.addEventListener("DOMContentLoaded", () => {
    initClasses().then(() => {
        makeTableRowsDraggable();
        updateScheduleOverview();
    });
    initSearch();
    initToggles();
    initPopupControls();
    initStudentSearchButton();
    initMainTabs();
    initSemesterTabs();
    initImportPopup();
    initEmphasisTags();
    initSaveStudentButton();

    // Recalculate credits on input/change anywhere in the document
    document.addEventListener("input", calculateCredits);
    document.addEventListener("change", calculateCredits);

    // Semester related controls
    els.semesterInput().addEventListener("change", updateSemesterTabs);
    els.addSemesterBtn().addEventListener("click", addSemesterTab);
});

/* -------------------- Student Info / Schedule Overview -------------------- */
// Ability to swap to and from the student info form and the schedule overview table
function initMainTabs() {
    const mainTabs = document.querySelectorAll(".main-tabs .tab");
    const mainContents = document.querySelectorAll("#studentTabs > .tab-content");

    mainTabs.forEach(tab => {
        tab.addEventListener("click", () => {
            mainTabs.forEach(t => t.classList.remove("active"));
            mainContents.forEach(c => c.classList.remove("active"));

            tab.classList.add("active");
            const target = document.getElementById(tab.dataset.tab);
            if (target) target.classList.add("active");

            if (tab.dataset.tab === "scheduleTab") {
                updateScheduleOverview();
            }
        });
    });
}

/* -------------------- EMPHASIS TAGS -------------------- */
// Sets up emphasis tabs
function initEmphasisTags() {
    const addBtn = document.getElementById("addButton");
    const select = document.getElementById("emphasis");
    const container = document.getElementById("emphasisTabs");

    addBtn.addEventListener("click", () => {
        const value = select.value;

        if (!value || value === "Area of emphasis" || emphasisList.includes(value)) return;

        emphasisList.push(value);
        renderEmphasisTags(container);
    });
}

// Renders in emphasis tabs when add is clicked
function renderEmphasisTags(container) {
    container.innerHTML = ""; // clear before re-render

    emphasisList.forEach((value, index) => {
        const tag = document.createElement("div");
        tag.className = "emphasis-tag";

        const textNode = document.createTextNode(value + " ");
        const removeBtn = document.createElement("span");
        removeBtn.className = "remove-btn";
        removeBtn.textContent = "X";
        removeBtn.dataset.index = index;

        removeBtn.addEventListener("click", (e) => {
            const i = Number(e.target.dataset.index);
            if (!Number.isNaN(i)) {
                emphasisList.splice(i, 1);
                renderEmphasisTags(container);
            }
        });

        tag.appendChild(textNode);
        tag.appendChild(removeBtn);
        container.appendChild(tag);
    });
}

/* -------------------- STUDENT LOADING -------------------- */

// Initialize the search button for fetching students
function initStudentSearchButton() {
    const btn = document.getElementById("searchStudentsBtn");
    if (btn) btn.addEventListener("click", fetchStudents);
}

// Fetches students according to search input
async function fetchStudents() {
    const studentsContainer = els.studentList();
    const input = els.studentSearch().value.trim().toLowerCase();

    studentsContainer.innerHTML = ""; // clear old results

    if (!input) {
        studentsContainer.innerHTML = "<div style='color:red;'>Please enter a student's name.</div>";
        return;
    }

    try {
        const res = await fetch("/api/students", { credentials: "include" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const studentsData = await res.json();

        const filtered = studentsData.filter(s =>
            `${s.FirstName} ${s.LastName} ${s.starID}`.toLowerCase().includes(input)
        );

        if (filtered.length === 0) {
            studentsContainer.innerHTML = "<div style='color:red;'>No students found.</div>";
            return;
        }

        renderStudentResults(filtered);

    } catch (err) {
        console.error("Error loading students:", err);
        studentsContainer.innerHTML = "<div style='color:red;'>Error loading students.</div>";
    }
}

function renderStudentResults(list) {
    const container = els.studentList();
    container.innerHTML = "";

    list.forEach(s => {
        const div = document.createElement("div");
        div.className = "student";
        div.textContent = `${s.FirstName} ${s.LastName} (${s.starID})`;
        div.addEventListener("click", () => loadStudentData(s.starID));
        container.appendChild(div);
    });
}

async function loadStudentData(starID) {
    try {
        const res = await fetch(`/api/student/${starID}`, { credentials: "include" });
        if (!res.ok) throw new Error("Failed to load student");

        const student = await res.json();

        // Populate basic fields
        document.getElementById("studentName").value = `${student.FirstName} ${student.LastName}`;
        document.getElementById("starID").value = student.starID;
        document.getElementById("notepadArea").value = student.notes || "";
        els.semesterInput().value = normalizeDate(student.startSemester);

        // Load emphasis tags
        const emph = student.areaOfEmphasis || "";
        emphasisList = emph.split("|").map(e => e.trim()).filter(Boolean);
        renderEmphasisTags(document.getElementById("emphasisTabs"));

        // Load advising table
        const allSemesters = JSON.parse(student.classes || "[]");
        populateAdvisingTable(allSemesters);

    } catch (err) {
        console.error("Error loading student:", err);
        alert("Unable to load student data.");
    }
}

/* -------------------- DATE HELPERS -------------------- */
function normalizeDate(dateStr) {
    if (!dateStr) return "";

    // yyyy-mm-dd
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;

    // mm/dd/yyyy
    if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateStr)) {
        const [m, d, y] = dateStr.split("/");
        return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
    }

    // yyyy/mm/dd
    if (/^\d{4}\/\d{1,2}\/\d{1,2}$/.test(dateStr)) {
        const [y, m, d] = dateStr.split("/");
        return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
    }

    // Fallback: Date parse
    const parsed = new Date(dateStr);
    if (!isNaN(parsed)) {
        const y = parsed.getFullYear();
        const m = String(parsed.getMonth() + 1).padStart(2, "0");
        const d = String(parsed.getDate()).padStart(2, "0");
        return `${y}-${m}-${d}`;
    }

    return "";
}

/* -------------------- ADVISING TABLE POPULATION -------------------- */
function populateAdvisingTable(allSemesters) {
    const semesterContents = document.querySelectorAll("#advisingTable .tab-content");

    semesterContents.forEach((content, semesterIndex) => {
        const table = content.querySelector("table");
        if (!table) return;

        // Clear old rows except header
        table.querySelectorAll("tr:not(:first-child)").forEach(r => r.remove());

        const semesterData = allSemesters[semesterIndex] || [];

        semesterData.forEach(c => {
            const row = table.insertRow();
            row.innerHTML = `
                <td class="courseID"><input type="text" value="${c.courseID || ""}"></td>
                <td class="courseTitle"><input type="text" value="${c.courseTitle || ""}"></td>
                <td class="credits"><input type="number" value="${c.credits || ""}"></td>
                <td class="status">
                    <select>
                        <option value="" disabled hidden>Status</option>
                        <option value="planned"     ${c.status === "planned"     ? "selected" : ""}>Planned</option>
                        <option value="in-progress" ${c.status === "in-progress" ? "selected" : ""}>In Progress</option>
                        <option value="completed"   ${c.status === "completed"   ? "selected" : ""}>Completed</option>
                        <option value="dropped"     ${c.status === "dropped"     ? "selected" : ""}>Dropped</option>
                    </select>
                </td>
            `;
        });

        // Add empty row at bottom
        addNewEmptyRow(table);
    });

    makeTableRowsDraggable();
    calculateCredits();
    updateScheduleOverview();
}

/* -------------------- CREDIT CALCULATION -------------------- */
function calculateCredits() {
    let core = 0;
    let genEd = 0;

    const rows = document.querySelectorAll(
        "#advisingTable .tab-content.active table tr:not(:first-child)"
    );

    rows.forEach(row => {
        const id = row.querySelector(".courseID input")?.value.trim();
        const status = row.querySelector(".status select")?.value;

        if (!id || status !== "completed") return;

        const classInfo = loadedClasses.find(c => c.courseID === id);
        if (!classInfo) return;

        const credits = Number(classInfo.credits || 0);

        if (classInfo.type === "Core") {
            core += credits;
        } else if (classInfo.type === "Gen Ed") {
            genEd += credits;
        }
    });

    document.getElementById("Core-Credits").value = `Core Credits Earned: ${core}`;
    document.getElementById("GenEd-Credits").value = `GenEd Credits Earned: ${genEd}`;
}

/* -------------------- CLASS LOADING -------------------- */
async function initClasses() {
    try {
        const res = await fetch("/api/classes", { credentials: "include" });
        if (!res.ok) throw new Error("Error loading classes");
        loadedClasses = await res.json();
        filterClasses();
    } catch (err) {
        console.error(err);
        els.classList().innerHTML = "<div style='color:red;'>Error loading classes</div>";
    }
}

/* -------------------- CLASS FILTERING -------------------- */
function initSearch() {
    const search = els.classSearch();
    if (search) search.addEventListener("input", filterClasses);
}

// Controls Class Toggle Buttons
function initToggles() {
    els.toggles().forEach(btn => {
        btn.addEventListener("click", () => {
            els.toggles().forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            filterClasses();
        });
    });
}

// Filters classes according to toggle and search input
function filterClasses() {
    const search = (els.classSearch()?.value || "").toLowerCase();
    const type = els.activeToggle()?.textContent.trim();

    if (!type) {
        renderClassList([]);
        return;
    }

    const filtered = loadedClasses.filter(c =>
        c.type === type &&
        (c.courseID.toLowerCase().includes(search) ||
         c.courseName.toLowerCase().includes(search))
    );

    renderClassList(filtered);
}

/* -------------------- CLASS POPULATION -------------------- */
function renderClassList(classes) {
    const list = els.classList();
    list.innerHTML = "";

    classes.forEach(c => {
        const div = document.createElement("div");
        div.className = "class";
        div.draggable = true;
        div.dataset.id = c.courseID;
        div.dataset.name = c.courseName;
        div.dataset.credits = c.credits;
        div.textContent = `${c.courseID} - ${c.courseName}`;
        list.appendChild(div);
    });
}

function getCredits(id) {
    return loadedClasses.find(c => c.courseID === id)?.credits || "";
}

/* -------------------- DRAG EVENTS -------------------- */
document.addEventListener("dragstart", e => {
    const classDiv = e.target.closest(".class");
    const row = e.target.closest("tr");

    if (classDiv) {
        e.dataTransfer.setData("text/plain", classDiv.textContent.trim());
        e.dataTransfer.effectAllowed = "copy";
        return;
    }

    if (row && row.rowIndex !== 0 && row.closest("#advisingTable")) {
        const id = row.querySelector(".courseID input")?.value.trim();
        const title = row.querySelector(".courseTitle input")?.value.trim();

        if (!id || !title) return;

        e.dataTransfer.setData("text/plain", `${id} - ${title}`);
        e.dataTransfer.effectAllowed = "move";
    }
});

document.addEventListener("dragover", e => {
    if (e.target.closest("#advisingTable tr") || e.target.closest("#classList")) {
        e.preventDefault();
    }
});

document.addEventListener("drop", e => {
    const row = e.target.closest("#advisingTable tr");
    const sidebar = e.target.closest("#classList");
    const data = e.dataTransfer.getData("text/plain");

    if (!data) return;
    e.preventDefault();

    /* -------------------- DROP TO TABLE -------------------- */
    if (row && row.rowIndex !== 0) {
        const [id, title] = data.split(" - ");
        const inputs = row.querySelectorAll("input");

        if (inputs.length >= 3) {
            inputs[0].value = id || "";
            inputs[1].value = title || "";
            inputs[2].value = getCredits(id);
        }

        // Remove from sidebar if exists
        const classDiv = [...els.classList().children].find(d => d.textContent === data);
        if (classDiv) classDiv.remove();

        // Add new empty row if last row is filled
        const table = row.closest("table");
        const lastRow = table.rows[table.rows.length - 1];
        const allFilled = [...lastRow.querySelectorAll("input")].every(inp => inp.value.trim() !== "");
        if (allFilled) addNewEmptyRow(table);

        makeTableRowsDraggable();
        calculateCredits();
        updateScheduleOverview();
    }

    /* -------------------- DROP TO SIDEBAR -------------------- */
    if (sidebar) {
        const [id, title] = data.split(" - ");

        // Find the row being dragged
        const rowToRemove = [...document.querySelectorAll("#advisingTable .tab-content.active tr:not(:first-child)")]
            .find(r => r.querySelector(".courseID input")?.value.trim() === id);

        if (!rowToRemove) return;

        // Remove row from table
        rowToRemove.remove();

        // Get credits from loadedClasses or fall back to row value or 3
        const credits = getCredits(id) ||
            rowToRemove.querySelector(".credits input")?.value ||
            3;

        // Create sidebar class div
        const div = document.createElement("div");
        div.className = "class";
        div.textContent = `${id} - ${title}`;
        div.dataset.id = id;
        div.dataset.name = title;
        div.dataset.credits = credits;
        div.draggable = true;

        sidebar.appendChild(div);

        // Reapply filtering and recalculations
        filterClasses();
        calculateCredits();
        updateScheduleOverview();
    }
});

/* -------------------- ADD EMPTY ROW -------------------- */
function addNewEmptyRow(table) {
    const newRow = table.insertRow();
    newRow.innerHTML = `
        <td class="courseID"><input type="text" placeholder="Course ID"></td>
        <td class="courseTitle"><input type="text" placeholder="Course Title"></td>
        <td class="credits"><input type="number" placeholder="Credits"></td>
        <td class="status">
            <select>
                <option value="" disabled hidden selected>Status</option>
                <option value="planned">Planned</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="dropped">Dropped</option>
            </select>
        </td>
    `;
    newRow.draggable = true;
}

function makeTableRowsDraggable() {
    document
        .querySelectorAll("#advisingTable .tab-content.active table tr:not(:first-child)")
        .forEach(row => row.draggable = true);
}

/* -------------------- ADVISING SEMESTER TABS -------------------- */
function initSemesterTabs() {
    const tabs = document.querySelectorAll("#advisingTable .advising-tabs .tab");
    const contents = document.querySelectorAll("#advisingTable .tab-content");

    tabs.forEach((tab, i) => {
        tab.addEventListener("click", () => {
            tabs.forEach(t => t.classList.remove("active"));
            contents.forEach(c => c.classList.remove("active"));

            tab.classList.add("active");
            const content = contents[i];
            if (content) content.classList.add("active");

            makeTableRowsDraggable();
            calculateCredits();
            updateScheduleOverview();
        });
    });
}

function getSemesterFromDate(date) {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = d.getMonth() + 1;

    // Semesters: Spring - Jan–May, Fall - Aug–Dec, Summer = Fall
    if (month >= 1 && month <= 5) {
        return { term: "Spring", year };
    } else if (month >= 8 && month <= 12) {
        return { term: "Fall", year };
    } else {
        return { term: "Fall", year };
    }
}

function generateSemesterSequence(startTerm, startYear, count = 4) {
    const semesters = [];
    let term = startTerm;
    let year = startYear;

    for (let i = 0; i < count; i++) {
        semesters.push(`${term} ${year}`);
        if (term === "Fall") {
            term = "Spring";
            year++;
        } else {
            term = "Fall";
        }
    }
    return semesters;
}

function updateSemesterTabs() {
    const dateValue = els.semesterInput().value;
    const tabs = document.querySelectorAll("#advisingTable .advising-tabs .tab");

    if (!tabs.length) return;

    if (!dateValue) {
        tabs.forEach((tab, i) => {
            tab.textContent = `Semester ${i + 1}`;
        });
        updateScheduleOverview();
        return;
    }

    const { term, year } = getSemesterFromDate(dateValue);
    const semesters = generateSemesterSequence(term, year, tabs.length);

    tabs.forEach((tab, i) => {
        tab.textContent = semesters[i];
    });

    updateScheduleOverview();
}

function addSemesterTab() {
    const tabsContainer = document.querySelector("#advisingTable .advising-tabs");
    const addBtn = els.addSemesterBtn();
    const contentsContainer = document.querySelectorAll("#advisingTable .tab-content")[0]?.parentElement;
    if (!tabsContainer || !addBtn || !contentsContainer) return;

    const dateValue = els.semesterInput().value;
    const semesterTabs = tabsContainer.querySelectorAll(".tab");
    const realCount = semesterTabs.length;

    let newSemesterName;
    if (dateValue) {
        const { term, year } = getSemesterFromDate(dateValue);
        const semesters = generateSemesterSequence(term, year, realCount + 1);
        newSemesterName = semesters[realCount];
    } else {
        newSemesterName = `Semester ${realCount + 1}`;
    }

    // Create new tab
    const newTab = document.createElement("button");
    newTab.classList.add("tab");
    newTab.textContent = newSemesterName;
    tabsContainer.insertBefore(newTab, addBtn);

    const newContent = document.createElement("div");
    newContent.classList.add("tab-content");
    newContent.innerHTML = `
        <div class="advising-table-scroll">
            <table>
                <tr>
                    <th>Course ID</th>
                    <th>Course Title</th>
                    <th>Credits</th>
                    <th>Status</th>
                </tr>
                <tr>
                    <td class="courseID"><input type="text" placeholder="Course ID"></td>
                    <td class="courseTitle"><input type="text" placeholder="Course Title"></td>
                    <td class="credits"><input type="number" placeholder="Credits"></td>
                    <td class="status">
                        <select>
                            <option value="" disabled hidden selected>Status</option>
                            <option value="planned">Planned</option>
                            <option value="in-progress">In Progress</option>
                            <option value="completed">Completed</option>
                            <option value="dropped">Dropped</option>
                        </select>
                    </td>
                </tr>
            </table>
        </div>
    `;
    contentsContainer.appendChild(newContent);

    initSemesterTabs();
    newTab.click();
    updateScheduleOverview();
}

/* -------------------- SCHEDULE OVERVIEW -------------------- */
function updateScheduleOverview() {
    const overview = els.overviewTable();
    if (!overview) return;

    const header = overview.querySelector("thead tr");
    const tbody = overview.querySelector("tbody");
    header.innerHTML = "";

    const semesterTabs = document.querySelectorAll("#advisingTable .advising-tabs .tab");
    const semesterContents = document.querySelectorAll("#advisingTable .tab-content");

    // Header
    semesterTabs.forEach(tab => {
        const th = document.createElement("th");
        th.textContent = tab.textContent.trim();
        header.appendChild(th);
    });

    const rows = [];
    const maxRowsDefault = 8;

    // Collect advising table rows
    semesterContents.forEach((content, semesterIndex) => {
        const tableRows = content.querySelectorAll("table tr:not(:first-child)");

        tableRows.forEach((r, rowIndex) => {
            const title = r.querySelector(".courseTitle input")?.value || "";
            if (!rows[rowIndex]) rows[rowIndex] = [];
            rows[rowIndex][semesterIndex] = title;
        });
    });

    const actualRowCount = rows.length;
    const finalRowCount = Math.max(maxRowsDefault, actualRowCount);

    tbody.innerHTML = "";

    for (let i = 0; i < finalRowCount; i++) {
        const tr = document.createElement("tr");

        for (let semesterIndex = 0; semesterIndex < semesterTabs.length; semesterIndex++) {
            const td = document.createElement("td");
            td.textContent = rows[i]?.[semesterIndex] || "";
            tr.appendChild(td);
        }

        tbody.appendChild(tr);
    }
}

/* -------------------- TIMESTAMP -------------------- */
function insertTimestamp() {
    const box = els.notes();
    if (!box) return;

    const stamp = `[${new Date().toLocaleString()}]\n`;
    const pos = box.selectionStart || 0;

    box.value = box.value.slice(0, pos) + stamp + box.value.slice(pos);
    box.selectionEnd = pos + stamp.length;
}

/* -------------------- NOTEPAD POPUP -------------------- */
function initPopupControls() {
    const open = document.getElementById("openPopupBtn");
    const close = document.getElementById("closePopupBtn");
    const popup = document.getElementById("myPopup");

    if (!open || !close || !popup) return;

    open.onclick = () => popup.style.display = "flex";
    close.onclick = () => popup.style.display = "none";
}

/* -------------------- IMPORT STUDENTS POPUP -------------------- */
function initImportPopup() {
    const open = document.getElementById("importBtn");
    const close = document.getElementById("closeImportPopupBtn");
    const popup = document.getElementById("importPopup");
    const fileInput = document.getElementById("importFile");
    const runImportBtn = document.getElementById("runImportBtn");
    const resultBox = document.getElementById("importResult");

    if (!open || !close || !popup || !fileInput || !runImportBtn || !resultBox) return;

    open.addEventListener("click", (e) => {
        e.preventDefault();
        popup.style.display = "flex";
        resultBox.value = "";
        fileInput.value = "";
    });

    close.onclick = () => {
        popup.style.display = "none";
    };

    runImportBtn.addEventListener("click", async () => {
        const file = fileInput.files[0];
        if (!file) {
            alert("Please select a .txt file first.");
            return;
        }

        try {
            const text = await file.text();
            const { successes, errors } = await importStudentsFromText(text);

            const lines = [];
            if (successes.length) {
                lines.push("Imported successfully:");
                lines.push(...successes, "");
            }
            if (errors.length) {
                lines.push("Errors:");
                lines.push(...errors);
            }

            resultBox.value = lines.join("\n") || "No lines found in file.";

            // Reload students list to show new imports
            fetchStudents();

        } catch (err) {
            console.error("Import error:", err);
            resultBox.value = "Unexpected error while importing students.";
        }
    });
}

/* -------------------- IMPORT STUDENTS -------------------- */
async function importStudentsFromText(text) {
    const lines = text.split(/\r?\n/);
    const successes = [];
    const errors = [];

    for (let i = 0; i < lines.length; i++) {
        const rawLine = lines[i];
        const line = rawLine.trim();
        if (!line) continue;

        const parts = line.split(",").map(p => p.trim());

        const starID = parts[0] || "";
        const firstName = parts[1] || "";
        const lastName = parts[2] || "";
        const startSemester = parts[3] || "";
        const emphasesRaw = parts[4] || "";

        if (!starID) {
            errors.push(`Line ${i + 1}: missing starID. (Line: "${rawLine}")`);
            continue;
        }

        // Multiple emphases separated by |
        const emphasesArray = emphasesRaw
            ? emphasesRaw.split("|").map(e => e.trim()).filter(Boolean)
            : [];

        const areaOfEmphasis = emphasesArray.join(" | ");

        const body = {
            starID,
            FirstName: firstName,
            LastName: lastName,
            areaOfEmphasis,
            startSemester,
            Classes: JSON.stringify([]),
            Notes: ""
        };

        try {
            const res = await fetch("/api/saveStudent", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
                credentials: "include"
            });

            if (!res.ok) throw new Error(`HTTP ${res.status}`);

            const data = await res.json();
            successes.push(`Line ${i + 1}: ${starID} imported (${data.message || "Saved"})`);
        } catch (err) {
            console.error("Error saving student:", err);
            errors.push(`Line ${i + 1}: ${starID} failed to import: ${err.message}`);
        }
    }

    return { successes, errors };
}

/* -------------------- SAVE STUDENTS -------------------- */
function initSaveStudentButton() {
    const btn = els.saveBtn();
    if (!btn) return;

    btn.addEventListener("click", async () => {
        const starID = document.getElementById("starID").value;
        const nameParts = document.getElementById("studentName").value.trim().split(" ");
        const firstName = nameParts[0] || "";
        const lastName = nameParts[1] || "";
        const emphasis = emphasisList.join(" | ");
        const notes = document.getElementById("notepadArea").value;
        const startSemester = els.semesterInput().value;

        const Classes = collectAllSemesters();

        const body = {
            starID,
            FirstName: firstName,
            LastName: lastName,
            areaOfEmphasis: emphasis,
            startSemester,
            Classes: JSON.stringify(Classes),
            Notes: notes
        };

        const res = await fetch("/api/saveStudent", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
            credentials: "include"
        });

        const data = await res.json();
        alert(data.message);
    });
}

/* -------------------- COLLECT CLASSES -------------------- */
function collectAdvisingTableData() {
    const rows = document.querySelectorAll("#advisingTable .tab-content.active table tr:not(:first-child)");
    const list = [];

    rows.forEach(row => {
        const id = row.querySelector(".courseID input")?.value.trim();
        const title = row.querySelector(".courseTitle input")?.value.trim();
        const credits = row.querySelector(".credits input")?.value.trim();
        const status = row.querySelector(".status select")?.value.trim();

        if (id && title) {
            list.push({ courseID: id, courseTitle: title, credits, status });
        }
    });

    return list;
}

function collectAllSemesters() {
    const semesterContents = document.querySelectorAll("#advisingTable .tab-content");
    const allSemesters = [];

    semesterContents.forEach(content => {
        const table = content.querySelector("table");
        if (!table) {
            allSemesters.push([]);
            return;
        }

        const rows = table.querySelectorAll("tr:not(:first-child)");
        const semesterData = [];

        rows.forEach(row => {
            const id = row.querySelector(".courseID input")?.value.trim();
            const title = row.querySelector(".courseTitle input")?.value.trim();
            const credits = row.querySelector(".credits input")?.value.trim();
            const status = row.querySelector(".status select")?.value.trim();

            if (id && title) {
                semesterData.push({ courseID: id, courseTitle: title, credits, status });
            }
        });

        allSemesters.push(semesterData);
    });

    return allSemesters;
}

/* -------------------- EXPORT TO PDF -------------------- */
function exportAdvisingReport() {
    const name = document.getElementById("studentName").value || "Unnamed Student";
    const starID = document.getElementById("starID").value || "N/A";
    const startSemester = els.semesterInput().value || "N/A";
    const emphases = emphasisList.join(" | ") || "None";
    const notes = document.getElementById("notepadArea").value || "";

    const semesterTabs = document.querySelectorAll("#advisingTable .advising-tabs .tab");
    const semesterContents = document.querySelectorAll("#advisingTable .tab-content");

    let semesterInfo = "";

    semesterTabs.forEach((tab, i) => {
        const semesterName = tab.textContent.trim();
        const rows = semesterContents[i].querySelectorAll("table tr:not(:first-child)");

        let tableInfo = `
            <h1>${semesterName}</h1>
            <table border="1" cellspacing="0" cellpadding="5">
                <tr>
                    <th>Course ID</th>
                    <th>Course Title</th>
                    <th>Credits</th>
                    <th>Status</th>
                </tr>
        `;

        rows.forEach(row => {
            const id = row.querySelector(".courseID input")?.value || "";
            const title = row.querySelector(".courseTitle input")?.value || "";
            const credits = row.querySelector(".credits input")?.value || "";
            const status = row.querySelector(".status select")?.value || "";

            if (id || title || credits || status) {
                tableInfo += `
                    <tr>
                        <td>${id}</td>
                        <td>${title}</td>
                        <td>${credits}</td>
                        <td>${status}</td>
                    </tr>
                `;
            }
        });

        tableInfo += "</table><br>";
        semesterInfo += tableInfo;
    });

    const advisingReport = `
        <div style="font-family: Arial; padding: 20px;">
            <h1>Advising Report — ${name}</h1>
            <p><Strong>Star ID:</Strong> ${starID}</p>
            <p><Strong>Date Started:</Strong> ${startSemester}</p>
            <p><Strong>Areas of Emphasis:</Strong> ${emphases}</p>
            <hr>
            <h1>Course Plan by Semester</h1>
            ${semesterInfo}
            <hr>
            <h1>Notes</h1>
            <pre style="white-space: pre-wrap; border:1px solid #ccc; padding:10px;">${notes}</pre>
        </div>
    `;

    const styles = {
        margin: 0.5,
        filename: `${name.replace(/\s+/g, "_")}_Advising_Report.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: "in", format: "letter", orientation: "portrait" }
    };

    html2pdf().from(advisingReport).set(styles).save();
}