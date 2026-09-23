(function () {
  "use strict";

  var STORAGE_KEY = "ledger-grades-data";

  /* -------------------------------------------------------
     Seed data — reconstructed from the original spreadsheet.
     Used the first time the app runs, and by "Reset to sample data".
  ------------------------------------------------------- */
  var SEED_DATA = {
    gpaScale: { "A": 4, "B+": 3.5, "B": 3, "C+": 2.5, "C": 2, "D+": 1.5, "D": 1, "F": 0, "S": null, "U": null },
    courses: [
      { id: "com-prog", name: "Com Prog", credit: 3, kind: "graded",
        items: [
          { id: "i1", name: "Test 1", score: 18.75, full: 25 },
          { id: "i2", name: "Test 2", score: 0, full: 25 },
          { id: "i3", name: "Test 3", score: 0, full: 30 },
          { id: "i4", name: "Project", score: 0, full: 10 },
          { id: "i5", name: "Grader", score: 5, full: 5 },
          { id: "i6", name: "Attendance", score: 5, full: 5 }
        ],
        scale: [ {cutoff:0,letter:"F"},{cutoff:50,letter:"D"},{cutoff:55,letter:"D+"},{cutoff:60,letter:"C"},{cutoff:65,letter:"C+"},{cutoff:70,letter:"B"},{cutoff:75,letter:"B+"},{cutoff:80,letter:"A"} ]
      },
      { id: "physics-1", name: "Physics I", credit: 3, kind: "graded",
        items: [
          { id: "i1", name: "Midterm", score: 0, full: 50 },
          { id: "i2", name: "Final", score: 0, full: 50 }
        ],
        scale: [ {cutoff:0,letter:"F"},{cutoff:33,letter:"D"},{cutoff:40,letter:"D+"},{cutoff:48,letter:"C"},{cutoff:56,letter:"C+"},{cutoff:64,letter:"B"},{cutoff:72,letter:"B+"},{cutoff:80,letter:"A"} ]
      },
      { id: "calculus-1", name: "Calculus I", credit: 3, kind: "graded",
        items: [
          { id: "i1", name: "Midterm", score: 0, full: 45 },
          { id: "i2", name: "Final", score: 0, full: 45 },
          { id: "i3", name: "Quiz", score: 8.75, full: 10 }
        ],
        scale: [ {cutoff:0,letter:"F"},{cutoff:30,letter:"D"},{cutoff:40,letter:"D+"},{cutoff:50,letter:"C"},{cutoff:60,letter:"C+"},{cutoff:70,letter:"B"},{cutoff:75,letter:"B+"},{cutoff:80,letter:"A"} ]
      },
      { id: "comm-eng", name: "Comm Eng", credit: 3, kind: "graded",
        items: [
          { id: "i1", name: "Presentation 1", score: 4.14, full: 5 },
          { id: "i2", name: "Presentation 2", score: 0, full: 5 },
          { id: "i3", name: "Essay 1", score: 0, full: 10 },
          { id: "i4", name: "Essay 2", score: 0, full: 10 },
          { id: "i5", name: "Classwork", score: 9.875, full: 10 },
          { id: "i6", name: "Midterm", score: 0, full: 25 },
          { id: "i7", name: "Final", score: 0, full: 25 }
        ],
        scale: [ {cutoff:0,letter:"F"},{cutoff:50,letter:"D"},{cutoff:55,letter:"D+"},{cutoff:60,letter:"C"},{cutoff:65,letter:"C+"},{cutoff:70,letter:"B"},{cutoff:75,letter:"B+"},{cutoff:80,letter:"A"} ]
      },
      { id: "explore", name: "Explore", credit: 3, kind: "graded",
        items: [
          { id: "i1", name: "Group Activity", score: 6, full: 48 },
          { id: "i2", name: "Quiz Intro to Cluster", score: 15, full: 16 },
          { id: "i3", name: "Teamwork", score: 1, full: 6 },
          { id: "i4", name: "Assignment", score: 2, full: 6 },
          { id: "i5", name: "Attendance", score: 6, full: 24 }
        ],
        scale: [ {cutoff:0,letter:"F"},{cutoff:50,letter:"D"},{cutoff:60,letter:"D+"},{cutoff:65,letter:"C"},{cutoff:70,letter:"C+"},{cutoff:75,letter:"B"},{cutoff:80,letter:"B+"},{cutoff:85,letter:"A"} ]
      },
      { id: "physics-lab", name: "Physics Lab", credit: 1, kind: "graded",
        items: [
          { id: "i1", name: "Lab 1", score: 7, full: 7 },
          { id: "i2", name: "Lab 2", score: 7, full: 7 },
          { id: "i3", name: "Lab 3", score: 7, full: 7 },
          { id: "i4", name: "Lab 4", score: 6, full: 7 },
          { id: "i5", name: "Lab 5", score: 6, full: 7 },
          { id: "i6", name: "Lab 6", score: 0, full: 7 },
          { id: "i7", name: "Lab 7", score: 0, full: 7 },
          { id: "i8", name: "Lab 8", score: 0, full: 7 },
          { id: "i9", name: "Lab 9", score: 0, full: 7 },
          { id: "i10", name: "Lab 10", score: 0, full: 7 },
          { id: "i11", name: "Final", score: 0, full: 30 }
        ],
        scale: [ {cutoff:0,letter:"F"},{cutoff:50,letter:"D"},{cutoff:60,letter:"D+"},{cutoff:65,letter:"C"},{cutoff:70,letter:"C+"},{cutoff:75,letter:"B"},{cutoff:80,letter:"B+"},{cutoff:85,letter:"A"} ]
      },
      { id: "gened", name: "Gened", credit: 3, kind: "satisfactory", items: [], scale: [] }
    ]
  };

  /* -------------------------------------------------------
     State
  ------------------------------------------------------- */
  var state = null;

  function loadState() {
    var raw = null;
    try { raw = localStorage.getItem(STORAGE_KEY); } catch (e) { /* storage unavailable */ }
    if (raw) {
      try { return migrate(JSON.parse(raw)); } catch (e) { /* fall through to seed */ }
    }
    return migrate(JSON.parse(JSON.stringify(SEED_DATA)));
  }

  function migrate(s) {
    (s.courses || []).forEach(function (c) { if (!c.semester) c.semester = "Semester 1"; });
    return s;
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      flashSaved();
    } catch (e) {
      flashSaved(true);
    }
  }

  var saveTimer = null;
  function flashSaved(failed) {
    var el = document.getElementById("saveStatus");
    var text = document.getElementById("saveStatusText");
    if (!el) return;
    el.classList.add("is-saving");
    text.textContent = failed ? "Couldn't save — storage unavailable" : "Saving…";
    clearTimeout(saveTimer);
    saveTimer = setTimeout(function () {
      el.classList.remove("is-saving");
      text.textContent = failed ? "Couldn't save — storage unavailable" : "All changes saved";
    }, 500);
  }

  function uid() {
    return "id" + Math.random().toString(36).slice(2, 10);
  }

  /* -------------------------------------------------------
     Calculations
  ------------------------------------------------------- */
  function computeCourse(course) {
    var totalScore = 0, totalFull = 0;
    (course.items || []).forEach(function (it) {
      totalScore += Number(it.score) || 0;
      totalFull += Number(it.full) || 0;
    });
    var percent = totalFull > 0 ? (totalScore / totalFull) * 100 : 0;

    var letter = null;
    if (course.kind === "satisfactory") {
      letter = "S";
    } else if (course.scale && course.scale.length) {
      var sorted = course.scale.slice().sort(function (a, b) { return a.cutoff - b.cutoff; });
      for (var i = 0; i < sorted.length; i++) {
        if (percent >= Number(sorted[i].cutoff)) letter = sorted[i].letter;
      }
      if (letter === null) letter = sorted[0] ? sorted[0].letter : null;
    }

    var gpaPoint = null;
    if (letter && state.gpaScale && Object.prototype.hasOwnProperty.call(state.gpaScale, letter)) {
      var v = state.gpaScale[letter];
      gpaPoint = (v === null || v === "" || v === undefined) ? null : Number(v);
    }

    return { totalScore: totalScore, totalFull: totalFull, percent: percent, letter: letter, gpaPoint: gpaPoint };
  }

  function computeOverall() {
    var totalCredits = 0, qualityPoints = 0, attemptedCredits = 0;
    state.courses.forEach(function (c) {
      attemptedCredits += Number(c.credit) || 0;
      var r = computeCourse(c);
      if (r.gpaPoint !== null && !isNaN(r.gpaPoint)) {
        qualityPoints += r.gpaPoint * (Number(c.credit) || 0);
        totalCredits += Number(c.credit) || 0;
      }
    });
    var cgpa = totalCredits > 0 ? qualityPoints / totalCredits : 0;
    return { cgpa: cgpa, totalCredits: totalCredits, attemptedCredits: attemptedCredits };
  }

  function computeBySemester() {
    var order = [], map = {};
    state.courses.forEach(function (c) {
      var sem = c.semester || "Semester 1";
      if (!map[sem]) { map[sem] = { name: sem, credits: 0, quality: 0, courses: [] }; order.push(sem); }
      map[sem].courses.push(c);
      var r = computeCourse(c);
      if (r.gpaPoint !== null && !isNaN(r.gpaPoint)) {
        map[sem].quality += r.gpaPoint * (Number(c.credit) || 0);
        map[sem].credits += Number(c.credit) || 0;
      }
    });
    return order.map(function (name) {
      var g = map[name];
      return { name: name, gpa: g.credits > 0 ? g.quality / g.credits : 0, courses: g.courses };
    });
  }

  // Assumes assessment items for a course add up to 100 points total (true of every
  // seeded course). Tells the learner what average they need on whatever's left.
  function whatIfMessage(course, targetPercent) {
    var r = computeCourse(course);
    var remaining = Math.max(0, 100 - r.totalFull);
    if (remaining <= 0) return "All items entered — final result is " + round2(r.percent) + "%.";
    var neededScore = targetPercent - r.totalScore;
    var neededPct = (neededScore / remaining) * 100;
    if (neededPct <= 0) return "Already secured " + targetPercent + "%+ no matter what's left.";
    if (neededPct > 100) return "Not reachable — the best possible is " + round2(r.totalScore + remaining) + "%.";
    return "Needs " + neededPct.toFixed(1) + "% (" + neededScore.toFixed(1) + " of " + round2(remaining) + " pts left) to reach " + targetPercent + "%.";
  }

  function letterClass(letter) {
    if (!letter) return "grade-none";
    if (letter === "S" || letter === "U") return "grade-s";
    if (letter[0] === "A") return "grade-a";
    if (letter[0] === "B") return "grade-b";
    if (letter[0] === "C") return "grade-c";
    if (letter[0] === "D") return "grade-d";
    if (letter[0] === "F") return "grade-f";
    return "grade-none";
  }

  /* -------------------------------------------------------
     Gauge (SVG arc, 0–4.0 scale, 240° sweep)
  ------------------------------------------------------- */
  function polar(cx, cy, r, angleDeg) {
    var a = ((angleDeg - 90) * Math.PI) / 180;
    return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
  }
  function arcPath(cx, cy, r, startAngle, endAngle) {
    var start = polar(cx, cy, r, endAngle);
    var end = polar(cx, cy, r, startAngle);
    var largeArc = endAngle - startAngle <= 180 ? 0 : 1;
    return "M " + start.x + " " + start.y + " A " + r + " " + r + " 0 " + largeArc + " 0 " + end.x + " " + end.y;
  }

  function renderGauge(cgpa) {
    var cx = 110, cy = 118, r = 92;
    var startAngle = -120, endAngle = 120;
    var track = document.getElementById("gaugeTrack");
    var fill = document.getElementById("gaugeFill");
    track.setAttribute("d", arcPath(cx, cy, r, startAngle, endAngle));
    var clamped = Math.max(0, Math.min(4, cgpa));
    var sweep = startAngle + (clamped / 4) * (endAngle - startAngle);
    fill.setAttribute("d", arcPath(cx, cy, r, startAngle, sweep));
    document.getElementById("cgpaValue").textContent = clamped.toFixed(2);
  }

  /* -------------------------------------------------------
     Rendering — Dashboard
  ------------------------------------------------------- */
  function renderDashboard() {
    var overall = computeOverall();
    renderGauge(overall.cgpa);

    document.getElementById("statCredits").textContent = overall.totalCredits;
    document.getElementById("statCourses").textContent = state.courses.length;

    var results = state.courses.map(function (c) {
      return { course: c, r: computeCourse(c) };
    });
    var graded = results.filter(function (x) { return x.course.kind !== "satisfactory" && x.r.totalFull > 0; });

    var highestEl = document.getElementById("statHighest");
    var lowestEl = document.getElementById("statLowest");
    if (graded.length) {
      var highest = graded.reduce(function (a, b) { return b.r.percent > a.r.percent ? b : a; });
      var lowest = graded.reduce(function (a, b) { return b.r.percent < a.r.percent ? b : a; });
      highestEl.textContent = highest.course.name + " · " + (highest.r.letter || "—");
      lowestEl.textContent = lowest.course.name + " · " + (lowest.r.letter || "—");
    } else {
      highestEl.textContent = "—";
      lowestEl.textContent = "—";
    }

    var list = document.getElementById("standingList");
    list.innerHTML = "";
    var semesters = computeBySemester();
    semesters.forEach(function (sem) {
      var head = document.createElement("div");
      head.className = "semester-header";
      var nameSpan = document.createElement("span");
      nameSpan.textContent = sem.name;
      var gpaSpan = document.createElement("span");
      gpaSpan.textContent = "GPA " + sem.gpa.toFixed(2);
      head.appendChild(nameSpan);
      head.appendChild(gpaSpan);
      list.appendChild(head);

      sem.courses.forEach(function (course) {
        var x = { course: course, r: computeCourse(course) };
        var row = document.createElement("div");
        row.className = "standing-row";

      var nameWrap = document.createElement("div");
      var nameEl = document.createElement("div");
      nameEl.className = "standing-name";
      nameEl.textContent = x.course.name || "Untitled course";
      var creditEl = document.createElement("div");
      creditEl.className = "standing-credit";
      creditEl.textContent = (Number(x.course.credit) || 0) + " credits";
      nameWrap.appendChild(nameEl);
      nameWrap.appendChild(creditEl);

      var track = document.createElement("div");
      track.className = "standing-bar-track";
      var barFill = document.createElement("div");
      barFill.className = "standing-bar-fill";
      barFill.style.width = Math.max(0, Math.min(100, x.r.percent)) + "%";
      track.appendChild(barFill);

      var pct = document.createElement("div");
      pct.className = "standing-percent";
      pct.textContent = x.course.kind === "satisfactory" ? "—" : Math.round(x.r.percent) + "%";

      var badge = document.createElement("span");
      badge.className = "badge " + letterClass(x.r.letter);
      badge.textContent = x.r.letter || "—";

        row.appendChild(nameWrap);
        row.appendChild(track);
        row.appendChild(pct);
        row.appendChild(badge);
        list.appendChild(row);
      });
    });
  }

  /* -------------------------------------------------------
     Rendering — Courses
  ------------------------------------------------------- */
  function renderCourses() {
    var wrap = document.getElementById("courseAccordion");
    var courseTpl = document.getElementById("courseTemplate");
    var openIds = Array.prototype.slice.call(wrap.querySelectorAll(".course.is-open")).map(function (n) { return n.dataset.id; });

    wrap.innerHTML = "";
    state.courses.forEach(function (course) {
      var node = courseTpl.content.firstElementChild.cloneNode(true);
      node.dataset.id = course.id;
      if (openIds.indexOf(course.id) !== -1) node.classList.add("is-open");

      var r = computeCourse(course);

      node.querySelector(".course-name-input").value = course.name;
      var badge = node.querySelector(".letter-badge");
      badge.textContent = r.letter || "—";
      badge.className = "badge letter-badge " + letterClass(r.letter);
      node.querySelector(".course-percent").textContent = course.kind === "satisfactory" ? "Pass / fail" : Math.round(r.percent) + "%";
      node.querySelector(".credit-num").textContent = Number(course.credit) || 0;

      node.querySelector(".credit-input").value = course.credit;
      node.querySelector(".kind-select").value = course.kind;
      node.querySelector(".semester-input").value = course.semester || "Semester 1";
      node.querySelector(".whatif-result").textContent = whatIfMessage(course, Number(node.querySelector(".whatif-target").value) || 80);

      var itemsList = node.querySelector(".items-list");
      var itemRowTpl = document.getElementById("itemRowTemplate");
      (course.items || []).forEach(function (item) {
        var row = itemRowTpl.content.firstElementChild.cloneNode(true);
        row.dataset.itemId = item.id;
        row.querySelector(".item-name").value = item.name;
        row.querySelector(".item-score").value = item.score;
        row.querySelector(".item-full").value = item.full;
        itemsList.appendChild(row);
      });
      node.querySelector(".total-score").textContent = round2(r.totalScore);
      node.querySelector(".total-full").textContent = round2(r.totalFull);

      var scaleList = node.querySelector(".scale-list");
      var scaleRowTpl = document.getElementById("scaleRowTemplate");
      (course.scale || []).slice().sort(function (a, b) { return a.cutoff - b.cutoff; }).forEach(function (row) {
        var rowEl = scaleRowTpl.content.firstElementChild.cloneNode(true);
        rowEl.querySelector(".scale-cutoff").value = row.cutoff;
        rowEl.querySelector(".scale-letter").value = row.letter;
        scaleList.appendChild(rowEl);
      });

      // Hide item/scale editing chrome for satisfactory (pass/fail) courses.
      if (course.kind === "satisfactory") {
        node.querySelector(".items-block").style.display = "none";
        node.querySelector(".scale-block").style.display = "none";
        node.querySelector(".whatif-block").style.display = "none";
      }

      wrap.appendChild(node);
    });

    var datalist = document.getElementById("semesterOptions");
    datalist.innerHTML = "";
    var seen = {};
    state.courses.forEach(function (c) {
      var sem = c.semester || "Semester 1";
      if (!seen[sem]) { seen[sem] = true; var opt = document.createElement("option"); opt.value = sem; datalist.appendChild(opt); }
    });
  }

  function round2(n) {
    return Math.round((Number(n) || 0) * 100) / 100;
  }

  function findCourse(id) {
    return state.courses.filter(function (c) { return c.id === id; })[0];
  }

  /* -------------------------------------------------------
     Rendering — Settings (GPA scale)
  ------------------------------------------------------- */
  function renderGpaScale() {
    var wrap = document.getElementById("gpaScaleEditor");
    var tpl = document.getElementById("gpaScaleRowTemplate");
    wrap.innerHTML = "";
    Object.keys(state.gpaScale).forEach(function (letter) {
      var row = tpl.content.firstElementChild.cloneNode(true);
      row.querySelector(".gpa-scale-letter").textContent = letter;
      var input = row.querySelector(".gpa-scale-point");
      var v = state.gpaScale[letter];
      input.value = (v === null || v === undefined) ? "" : v;
      input.addEventListener("input", function () {
        state.gpaScale[letter] = input.value === "" ? null : Number(input.value);
        saveState();
        renderDashboard();
        renderCourses();
      });
      wrap.appendChild(row);
    });
  }

  /* -------------------------------------------------------
     Full re-render
  ------------------------------------------------------- */
  function renderAll() {
    renderDashboard();
    renderCourses();
    renderGpaScale();
  }

  /* -------------------------------------------------------
     Event wiring — navigation
  ------------------------------------------------------- */
  function setupNav() {
    var navItems = document.querySelectorAll(".nav-item");
    var pageTitle = document.getElementById("pageTitle");
    var titles = { dashboard: "Dashboard", courses: "Courses", settings: "Settings" };

    navItems.forEach(function (btn) {
      btn.addEventListener("click", function () {
        navItems.forEach(function (b) { b.classList.remove("is-active"); });
        btn.classList.add("is-active");
        document.querySelectorAll(".page").forEach(function (p) { p.classList.remove("is-active"); });
        document.getElementById("page-" + btn.dataset.page).classList.add("is-active");
        pageTitle.textContent = titles[btn.dataset.page];
        document.querySelector(".sidebar").classList.remove("is-open");
      });
    });

    document.getElementById("menuBtn").addEventListener("click", function () {
      document.querySelector(".sidebar").classList.toggle("is-open");
    });
  }

  /* -------------------------------------------------------
     Event wiring — theme
  ------------------------------------------------------- */
  function setupTheme() {
    var THEME_KEY = "ledger-theme";
    var saved = null;
    try { saved = localStorage.getItem(THEME_KEY); } catch (e) {}
    var theme = saved || "dark";
    applyTheme(theme);

    document.getElementById("themeToggle").addEventListener("click", function () {
      theme = theme === "dark" ? "light" : "dark";
      applyTheme(theme);
      try { localStorage.setItem(THEME_KEY, theme); } catch (e) {}
    });

    function applyTheme(t) {
      document.body.setAttribute("data-theme", t);
      document.getElementById("themeToggleLabel").textContent = t === "dark" ? "Dark mode" : "Light mode";
    }
  }

  /* -------------------------------------------------------
     Event wiring — courses page (delegated)
  ------------------------------------------------------- */
  function setupCoursesPage() {
    var wrap = document.getElementById("courseAccordion");

    wrap.addEventListener("click", function (e) {
      var summary = e.target.closest(".course-summary");
      var courseEl = e.target.closest(".course");
      if (!courseEl) return;
      var id = courseEl.dataset.id;
      var course = findCourse(id);

      if (summary && !e.target.closest(".course-name-input")) {
        courseEl.classList.toggle("is-open");
        return;
      }

      if (e.target.closest(".delete-course-btn")) {
        var cIdx = state.courses.indexOf(course);
        state.courses = state.courses.filter(function (c) { return c.id !== id; });
        saveState();
        renderAll();
        showToast('"' + course.name + '" removed', function () {
          state.courses.splice(cIdx, 0, course);
          saveState();
          renderAll();
        });
        return;
      }

      if (e.target.closest(".add-item-btn")) {
        course.items.push({ id: uid(), name: "New item", score: 0, full: 0 });
        saveState();
        renderCourses();
        reopen(id);
        return;
      }

      if (e.target.closest(".row-remove") && e.target.closest(".items-list")) {
        var itemRow = e.target.closest(".items-row");
        var itemId = itemRow.dataset.itemId;
        var removedItem = course.items.filter(function (it) { return it.id === itemId; })[0];
        var iIdx = course.items.indexOf(removedItem);
        course.items = course.items.filter(function (it) { return it.id !== itemId; });
        saveState();
        renderCourses();
        renderDashboard();
        reopen(id);
        showToast('"' + removedItem.name + '" removed', function () {
          course.items.splice(iIdx, 0, removedItem);
          saveState();
          renderCourses();
          renderDashboard();
          reopen(id);
        });
        return;
      }

      if (e.target.closest(".add-cutoff-btn")) {
        course.scale.push({ cutoff: 0, letter: "F" });
        saveState();
        renderCourses();
        reopen(id);
        return;
      }

      if (e.target.closest(".row-remove") && e.target.closest(".scale-list")) {
        var scaleRow = e.target.closest(".scale-row");
        scaleRow.remove();
        rebuildScaleFromDom(courseEl, course);
        saveState();
        renderCourses();
        reopen(id);
        return;
      }
    });

    wrap.addEventListener("input", function (e) {
      var courseEl = e.target.closest(".course");
      if (!courseEl) return;
      var id = courseEl.dataset.id;
      var course = findCourse(id);

      if (e.target.classList.contains("course-name-input")) {
        course.name = e.target.value;
        saveState();
        renderDashboard();
        return;
      }
      if (e.target.classList.contains("credit-input")) {
        course.credit = e.target.value === "" ? 0 : Number(e.target.value);
        saveState();
        var creditNum = courseEl.querySelector(".credit-num");
        if (creditNum) creditNum.textContent = course.credit;
        renderDashboard();
        return;
      }
      if (e.target.classList.contains("semester-input")) {
        course.semester = e.target.value.trim() || "Semester 1";
        saveState();
        renderDashboard();
        return;
      }
      if (e.target.classList.contains("whatif-target")) {
        var target = Number(e.target.value) || 0;
        courseEl.querySelector(".whatif-result").textContent = whatIfMessage(course, target);
        return;
      }
      if (e.target.classList.contains("item-name")) {
        var row = e.target.closest(".items-row");
        var item = course.items.filter(function (it) { return it.id === row.dataset.itemId; })[0];
        if (item) { item.name = e.target.value; saveState(); }
        return;
      }
      if (e.target.classList.contains("item-score") || e.target.classList.contains("item-full")) {
        var row2 = e.target.closest(".items-row");
        var item2 = course.items.filter(function (it) { return it.id === row2.dataset.itemId; })[0];
        if (item2) {
          item2.score = e.target.classList.contains("item-score") ? Number(e.target.value) || 0 : item2.score;
          item2.full = e.target.classList.contains("item-full") ? Number(e.target.value) || 0 : item2.full;
          saveState();
          updateCourseLiveTotals(courseEl, course);
          renderDashboard();
        }
        return;
      }
      if (e.target.classList.contains("scale-cutoff") || e.target.classList.contains("scale-letter")) {
        rebuildScaleFromDom(courseEl, course);
        saveState();
        updateCourseLiveBadge(courseEl, course);
        renderDashboard();
        return;
      }
    });

    wrap.addEventListener("change", function (e) {
      var courseEl = e.target.closest(".course");
      if (!courseEl) return;
      var id = courseEl.dataset.id;
      var course = findCourse(id);
      if (e.target.classList.contains("kind-select")) {
        course.kind = e.target.value;
        saveState();
        renderCourses();
        reopen(id);
        renderDashboard();
      }
    });

    document.getElementById("addCourseBtn").addEventListener("click", function () {
      var id = uid();
      state.courses.push({
        id: id, name: "New course", credit: 3, kind: "graded",
        items: [{ id: uid(), name: "Assignment 1", score: 0, full: 100 }],
        scale: [ {cutoff:0,letter:"F"},{cutoff:50,letter:"D"},{cutoff:55,letter:"D+"},{cutoff:60,letter:"C"},{cutoff:65,letter:"C+"},{cutoff:70,letter:"B"},{cutoff:75,letter:"B+"},{cutoff:80,letter:"A"} ]
      });
      saveState();
      renderCourses();
      renderDashboard();
      reopen(id);
      var el = wrap.querySelector('.course[data-id="' + id + '"] .course-name-input');
      if (el) { el.focus(); el.select(); }
    });
  }

  var pendingUndo = null, toastTimer2 = null;
  function showToast(message, undoFn) {
    pendingUndo = undoFn;
    var toast = document.getElementById("toast");
    toast.querySelector(".toast-msg").textContent = message;
    toast.classList.add("is-visible");
    clearTimeout(toastTimer2);
    toastTimer2 = setTimeout(function () {
      toast.classList.remove("is-visible");
      pendingUndo = null;
    }, 6000);
  }

  function reopen(id) {
    var el = document.querySelector('.course[data-id="' + id + '"]');
    if (el) el.classList.add("is-open");
  }

  function rebuildScaleFromDom(courseEl, course) {
    var rows = courseEl.querySelectorAll(".scale-list .scale-row");
    var scale = [];
    rows.forEach(function (row) {
      var cutoff = Number(row.querySelector(".scale-cutoff").value) || 0;
      var letter = (row.querySelector(".scale-letter").value || "").trim() || "F";
      scale.push({ cutoff: cutoff, letter: letter });
    });
    course.scale = scale;
  }

  // Lightweight DOM patch for the fields that change on every keystroke,
  // so the whole accordion doesn't re-render (and lose focus) while typing.
  function updateCourseLiveTotals(courseEl, course) {
    var r = computeCourse(course);
    courseEl.querySelector(".total-score").textContent = round2(r.totalScore);
    courseEl.querySelector(".total-full").textContent = round2(r.totalFull);
    courseEl.querySelector(".course-percent").textContent = course.kind === "satisfactory" ? "Pass / fail" : Math.round(r.percent) + "%";
    var badge = courseEl.querySelector(".letter-badge");
    badge.textContent = r.letter || "—";
    badge.className = "badge letter-badge " + letterClass(r.letter);
    var targetInput = courseEl.querySelector(".whatif-target");
    var whatifOut = courseEl.querySelector(".whatif-result");
    if (targetInput && whatifOut) whatifOut.textContent = whatIfMessage(course, Number(targetInput.value) || 80);
  }
  function updateCourseLiveBadge(courseEl, course) {
    updateCourseLiveTotals(courseEl, course);
  }

  /* -------------------------------------------------------
     Event wiring — settings / data
  ------------------------------------------------------- */
  function setupSettings() {
    document.getElementById("exportBtn").addEventListener("click", function () {
      var blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
      var url = URL.createObjectURL(blob);
      var a = document.createElement("a");
      a.href = url;
      a.download = "ledger-grades-backup-" + new Date().toISOString().slice(0, 10) + ".json";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    });

    document.getElementById("importInput").addEventListener("change", function (e) {
      var file = e.target.files[0];
      if (!file) return;
      var reader = new FileReader();
      reader.onload = function () {
        try {
          var parsed = JSON.parse(reader.result);
          if (!parsed.courses || !parsed.gpaScale) throw new Error("bad shape");
          state = parsed;
          saveState();
          renderAll();
        } catch (err) {
          alert("That file doesn't look like a Ledger backup.");
        }
      };
      reader.readAsText(file);
      e.target.value = "";
    });

    document.getElementById("resetBtn").addEventListener("click", function () {
      if (confirm("Reset all data back to the original sample courses? Your current data will be lost unless you've exported a backup.")) {
        state = JSON.parse(JSON.stringify(SEED_DATA));
        saveState();
        renderAll();
      }
    });
  }

  /* -------------------------------------------------------
     Init
  ------------------------------------------------------- */
  document.addEventListener("DOMContentLoaded", function () {
    state = loadState();
    setupNav();
    setupTheme();
    setupCoursesPage();
    setupSettings();
    renderAll();

    document.getElementById("toastUndo").addEventListener("click", function () {
      if (pendingUndo) { pendingUndo(); pendingUndo = null; }
      document.getElementById("toast").classList.remove("is-visible");
    });

    document.getElementById("printBtn").addEventListener("click", function () {
      window.print();
    });

    if ("serviceWorker" in navigator) {
      window.addEventListener("load", function () {
        navigator.serviceWorker.register("sw.js").catch(function () {});
      });
    }
  });
})();
