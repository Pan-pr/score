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
          { id: "i2", name: "Test 2", score: null, full: 25 },
          { id: "i3", name: "Test 3", score: null, full: 30 },
          { id: "i4", name: "Project", score: null, full: 10 },
          { id: "i5", name: "Grader", score: 5, full: 5 },
          { id: "i6", name: "Attendance", score: 5, full: 5 }
        ],
        scale: [ {cutoff:0,letter:"F"},{cutoff:50,letter:"D"},{cutoff:55,letter:"D+"},{cutoff:60,letter:"C"},{cutoff:65,letter:"C+"},{cutoff:70,letter:"B"},{cutoff:75,letter:"B+"},{cutoff:80,letter:"A"} ]
      },
      { id: "physics-1", name: "Physics I", credit: 3, kind: "graded",
        items: [
          { id: "i1", name: "Midterm", score: null, full: 50 },
          { id: "i2", name: "Final", score: null, full: 50 }
        ],
        scale: [ {cutoff:0,letter:"F"},{cutoff:33,letter:"D"},{cutoff:40,letter:"D+"},{cutoff:48,letter:"C"},{cutoff:56,letter:"C+"},{cutoff:64,letter:"B"},{cutoff:72,letter:"B+"},{cutoff:80,letter:"A"} ]
      },
      { id: "calculus-1", name: "Calculus I", credit: 3, kind: "graded",
        items: [
          { id: "i1", name: "Midterm", score: null, full: 45 },
          { id: "i2", name: "Final", score: null, full: 45 },
          { id: "i3", name: "Quiz", score: 8.75, full: 10 }
        ],
        scale: [ {cutoff:0,letter:"F"},{cutoff:30,letter:"D"},{cutoff:40,letter:"D+"},{cutoff:50,letter:"C"},{cutoff:60,letter:"C+"},{cutoff:70,letter:"B"},{cutoff:75,letter:"B+"},{cutoff:80,letter:"A"} ]
      },
      { id: "comm-eng", name: "Comm Eng", credit: 3, kind: "graded",
        items: [
          { id: "i1", name: "Presentation 1", score: 4.14, full: 5 },
          { id: "i2", name: "Presentation 2", score: null, full: 5 },
          { id: "i3", name: "Essay 1", score: null, full: 10 },
          { id: "i4", name: "Essay 2", score: null, full: 10 },
          { id: "i5", name: "Classwork", score: 9.875, full: 10 },
          { id: "i6", name: "Midterm", score: null, full: 25 },
          { id: "i7", name: "Final", score: null, full: 25 }
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
          { id: "i6", name: "Lab 6", score: null, full: 7 },
          { id: "i7", name: "Lab 7", score: null, full: 7 },
          { id: "i8", name: "Lab 8", score: null, full: 7 },
          { id: "i9", name: "Lab 9", score: null, full: 7 },
          { id: "i10", name: "Lab 10", score: null, full: 7 },
          { id: "i11", name: "Final", score: null, full: 30 }
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

  /* -------------------------------------------------------
     Terms — every year has Semester 1 and Semester 2, plus an
     optional Summer. Ids are stable: "y1-1", "y1-2", "y1-summer".
  ------------------------------------------------------- */
  var TERM_KINDS = ["1", "2", "summer"];
  var TERM_NAMES = { "1": "Semester 1", "2": "Semester 2", "summer": "Summer" };
  var DEFAULT_YEARS = 4;

  function termId(year, kind) { return "y" + year + "-" + kind; }

  function sortTerms(terms) {
    terms.sort(function (a, b) {
      return a.year - b.year || TERM_KINDS.indexOf(a.kind) - TERM_KINDS.indexOf(b.kind);
    });
  }

  // Makes sure the term exists (and that its year has both regular semesters).
  function ensureTerm(s, year, kind) {
    var kinds = kind === "summer" ? ["1", "2", "summer"] : ["1", "2"];
    kinds.forEach(function (k) {
      var id = termId(year, k);
      if (!s.terms.some(function (t) { return t.id === id; })) s.terms.push({ id: id, year: year, kind: k });
    });
    sortTerms(s.terms);
    return termId(year, kind);
  }

  function yearCount(s) {
    return s.terms.reduce(function (m, t) { return Math.max(m, t.year); }, 0);
  }

  function addYear(s) {
    var year = yearCount(s) + 1;
    ensureTerm(s, year, "1");
    return year;
  }

  function termLabel(t) {
    return "Year " + t.year + " · " + TERM_NAMES[t.kind];
  }

  function migrate(s) {
    s.courses = s.courses || [];
    if (!s.terms) {
      s.terms = [];
      for (var y = 0; y < DEFAULT_YEARS; y++) addYear(s);
      // Older saves named semesters freely. Map each name, in order of first
      // use, onto the regular slots (Y1 S1, Y1 S2, Y2 S1, …); names containing
      // "summer" go to the summer of the year reached so far.
      var slot = 0, map = {};
      s.courses.forEach(function (c) {
        var name = c.semester || "Semester 1";
        if (map[name]) return;
        if (/summer/i.test(name)) {
          map[name] = ensureTerm(s, Math.max(1, Math.ceil(slot / 2)), "summer");
        } else {
          map[name] = ensureTerm(s, Math.floor(slot / 2) + 1, slot % 2 === 0 ? "1" : "2");
          slot++;
        }
      });
      s.courses.forEach(function (c) {
        c.termId = map[c.semester || "Semester 1"];
        delete c.semester;
      });
    }
    if (!s.terms.length) addYear(s);
    sortTerms(s.terms);
    var ids = s.terms.map(function (t) { return t.id; });
    s.courses.forEach(function (c) {
      if (ids.indexOf(c.termId) === -1) c.termId = ids[0];
      (c.items || []).forEach(function (it) { if (it.score === "" || it.score === undefined) it.score = null; });
    });
    if (s.creditsRequired === undefined) s.creditsRequired = null;
    return s;
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn("Ledger: couldn't save — local storage unavailable.");
    }
  }

  function uid() {
    return "id" + Math.random().toString(36).slice(2, 10);
  }

  /* -------------------------------------------------------
     Calculations
  ------------------------------------------------------- */
  function computeCourse(course) {
    // An item with score null hasn't been graded yet. "percent" is the average
    // over graded work only, so upcoming exams don't drag the standing to F.
    var totalScore = 0, totalFull = 0, gradedFull = 0;
    (course.items || []).forEach(function (it) {
      var full = Number(it.full) || 0;
      totalFull += full;
      if (isGraded(it)) {
        totalScore += Number(it.score) || 0;
        gradedFull += full;
      }
    });
    var percent = gradedFull > 0 ? (totalScore / gradedFull) * 100 : 0;
    var hasGrades = gradedFull > 0;

    var letter = null;
    if (course.withdrawn) {
      letter = "W";
    } else if (course.kind === "satisfactory") {
      letter = "S";
    } else if (hasGrades && course.scale && course.scale.length) {
      var sorted = course.scale.slice().sort(function (a, b) { return a.cutoff - b.cutoff; });
      for (var i = 0; i < sorted.length; i++) {
        if (percent >= Number(sorted[i].cutoff)) letter = sorted[i].letter;
      }
      if (letter === null) letter = sorted[0] ? sorted[0].letter : null;
    }

    var gpaPoint = null;
    if (letter && letter !== "W" && state.gpaScale && Object.prototype.hasOwnProperty.call(state.gpaScale, letter)) {
      var v = state.gpaScale[letter];
      gpaPoint = (v === null || v === "" || v === undefined) ? null : Number(v);
    }

    return {
      totalScore: totalScore, totalFull: totalFull, gradedFull: gradedFull,
      remainingFull: totalFull - gradedFull, percent: percent, hasGrades: hasGrades,
      letter: letter, gpaPoint: gpaPoint
    };
  }

  function isGraded(item) {
    return item.score !== null && item.score !== undefined && item.score !== "";
  }

  function computeOverall() {
    var totalCredits = 0, qualityPoints = 0, attemptedCredits = 0, earned = 0;
    state.courses.forEach(function (c) {
      attemptedCredits += Number(c.credit) || 0;
      var r = computeCourse(c);
      earned += earnedCredits(c, r);
      if (r.gpaPoint !== null && !isNaN(r.gpaPoint)) {
        qualityPoints += r.gpaPoint * (Number(c.credit) || 0);
        totalCredits += Number(c.credit) || 0;
      }
    });
    var cgpa = totalCredits > 0 ? qualityPoints / totalCredits : 0;
    return { cgpa: cgpa, totalCredits: totalCredits, attemptedCredits: attemptedCredits, earnedCredits: earned };
  }

  // Credits that count toward the total: not withdrawn and not failed.
  function earnedCredits(course, r) {
    if (course.withdrawn || r.letter === "F" || r.letter === "U") return 0;
    return Number(course.credit) || 0;
  }

  function statsFor(courses) {
    var quality = 0, gpaCredits = 0, credits = 0;
    courses.forEach(function (c) {
      var r = computeCourse(c);
      credits += earnedCredits(c, r);
      if (r.gpaPoint !== null && !isNaN(r.gpaPoint)) {
        quality += r.gpaPoint * (Number(c.credit) || 0);
        gpaCredits += Number(c.credit) || 0;
      }
    });
    return {
      quality: quality, gpaCredits: gpaCredits, credits: credits,
      gpa: gpaCredits > 0 ? quality / gpaCredits : 0, hasGpa: gpaCredits > 0
    };
  }

  // Terms in order, each with its courses, its own GPA, and the cumulative
  // GPA (GPAX) up to and including that term.
  function computeTerms() {
    var runQuality = 0, runCredits = 0;
    return state.terms.map(function (t) {
      var courses = state.courses.filter(function (c) { return c.termId === t.id; });
      var stats = statsFor(courses);
      runQuality += stats.quality;
      runCredits += stats.gpaCredits;
      return {
        term: t, name: TERM_NAMES[t.kind], courses: courses, stats: stats,
        cumulative: runCredits > 0 ? runQuality / runCredits : null
      };
    });
  }

  function computeYears() {
    var years = [];
    computeTerms().forEach(function (t) {
      var y = years[years.length - 1];
      if (!y || y.year !== t.term.year) {
        y = { year: t.term.year, terms: [], courses: [] };
        years.push(y);
      }
      y.terms.push(t);
      y.courses = y.courses.concat(t.courses);
    });
    years.forEach(function (y) { y.stats = statsFor(y.courses); });
    return years;
  }

  function statsMeta(stats) {
    return (stats.hasGpa ? "GPA " + stats.gpa.toFixed(2) : "GPA —") + " · " + stats.credits + " credits";
  }

  function termMeta(t) {
    var gpax = t.stats.hasGpa && t.cumulative !== null ? " · GPAX " + t.cumulative.toFixed(2) : "";
    return (t.stats.hasGpa ? "GPA " + t.stats.gpa.toFixed(2) : "GPA —") + gpax + " · " + t.stats.credits + " credits";
  }

  // Tells the learner what average they need on the not-yet-graded items to
  // finish the course at targetPercent of its total points.
  function whatIfMessage(course, targetPercent) {
    var r = computeCourse(course);
    if (r.totalFull <= 0) return "Add assessment items to see what you need.";
    var remaining = r.remainingFull;
    if (remaining <= 0) return "All items graded — final result is " + round2(r.percent) + "%.";
    var neededScore = (targetPercent / 100) * r.totalFull - r.totalScore;
    var neededPct = (neededScore / remaining) * 100;
    if (neededPct <= 0) return "Already secured " + targetPercent + "%+ no matter what's left.";
    if (neededPct > 100) return "Not reachable — the best possible is " + round2(((r.totalScore + remaining) / r.totalFull) * 100) + "%.";
    return "Needs " + neededPct.toFixed(1) + "% on what's left (" + neededScore.toFixed(1) + " of " + round2(remaining) + " pts) to reach " + targetPercent + "%.";
  }

  // Points still needed (on this course's own point scale) to reach the next
  // letter grade up, e.g. "6.3 pts to B+". Returns null if not applicable.
  function nextLetterGap(course) {
    if (course.kind === "satisfactory" || course.withdrawn) return null;
    if (!course.scale || !course.scale.length) return null;
    var r = computeCourse(course);
    var sorted = course.scale.slice().sort(function (a, b) { return a.cutoff - b.cutoff; });
    var next = null;
    for (var i = 0; i < sorted.length; i++) {
      if (Number(sorted[i].cutoff) > r.percent) { next = sorted[i]; break; }
    }
    if (!next) return null; // already at the top letter on this scale
    if (!r.hasGrades || r.remainingFull <= 0) return null;
    var pointsNeeded = (Number(next.cutoff) / 100) * r.totalFull - r.totalScore;
    if (pointsNeeded > r.remainingFull) return null; // out of reach
    return "Needs " + pointsNeeded.toFixed(1) + " of " + round2(r.remainingFull) + " remaining pts for " + next.letter;
  }

  function letterClass(letter) {
    if (!letter) return "grade-none";
    if (letter === "W") return "grade-w";
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

    document.getElementById("statCredits").textContent = overall.earnedCredits +
      (state.creditsRequired ? " / " + state.creditsRequired : "");
    document.getElementById("statCourses").textContent = state.courses.length;

    var results = state.courses.map(function (c) {
      return { course: c, r: computeCourse(c) };
    });
    var graded = results.filter(function (x) { return x.course.kind !== "satisfactory" && !x.course.withdrawn && x.r.hasGrades; });

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
    var years = computeYears().filter(function (y) { return y.courses.length; });
    if (!years.length) {
      var empty = document.createElement("p");
      empty.className = "term-empty";
      empty.textContent = "No courses yet. Add them on the Courses page.";
      list.appendChild(empty);
    }
    years.forEach(function (y) {
      list.appendChild(headerRow("year-header", "Year " + y.year, statsMeta(y.stats)));
      y.terms.forEach(function (t) {
        if (!t.courses.length) return;
        list.appendChild(headerRow("semester-header", t.name, termMeta(t)));
        t.courses.forEach(function (course) { list.appendChild(buildStandingRow(course)); });
      });
    });
  }

  function headerRow(className, title, meta) {
    var head = document.createElement("div");
    head.className = className;
    var nameSpan = document.createElement("span");
    nameSpan.textContent = title;
    var metaSpan = document.createElement("span");
    metaSpan.textContent = meta;
    head.appendChild(nameSpan);
    head.appendChild(metaSpan);
    return head;
  }

  function buildStandingRow(course) {
    var r = computeCourse(course);
    var row = document.createElement("div");
    row.className = "standing-row" + (course.withdrawn ? " is-withdrawn" : "");

    var nameWrap = document.createElement("div");
    var nameEl = document.createElement("div");
    nameEl.className = "standing-name";
    nameEl.textContent = course.name || "Untitled course";
    var creditEl = document.createElement("div");
    creditEl.className = "standing-credit";
    creditEl.textContent = (Number(course.credit) || 0) + " credits" +
      (course.kind === "satisfactory" || !r.totalFull ? "" :
        " · " + round2(r.gradedFull) + " of " + round2(r.totalFull) + " pts graded");
    nameWrap.appendChild(nameEl);
    nameWrap.appendChild(creditEl);
    var gap = nextLetterGap(course);
    if (gap) {
      var targetEl = document.createElement("div");
      targetEl.className = "standing-target";
      targetEl.textContent = gap;
      nameWrap.appendChild(targetEl);
    }

    var track = document.createElement("div");
    track.className = "standing-bar-track";
    var barFill = document.createElement("div");
    barFill.className = "standing-bar-fill";
    barFill.style.width = (course.withdrawn ? 0 : Math.max(0, Math.min(100, r.percent))) + "%";
    track.appendChild(barFill);

    var pct = document.createElement("div");
    pct.className = "standing-percent";
    pct.textContent = (course.kind === "satisfactory" || course.withdrawn || !r.hasGrades) ? "—" : Math.round(r.percent) + "%";

    var badge = document.createElement("span");
    badge.className = "badge " + letterClass(r.letter);
    badge.textContent = r.letter || "—";

    row.appendChild(nameWrap);
    row.appendChild(track);
    row.appendChild(pct);
    row.appendChild(badge);
    return row;
  }

  /* -------------------------------------------------------
     Rendering — Courses
  ------------------------------------------------------- */
  var collapsedYears = {};

  function renderCourses() {
    var wrap = document.getElementById("courseAccordion");
    var openIds = Array.prototype.slice.call(wrap.querySelectorAll(".course.is-open")).map(function (n) { return n.dataset.id; });

    wrap.innerHTML = "";
    var years = computeYears();
    years.forEach(function (y, i) {
      var isLast = i === years.length - 1;
      var yearEl = buildYearSection(y, isLast && years.length > 1 && !y.courses.length);
      wrap.appendChild(yearEl);
      var termsWrap = yearEl.querySelector(".year-terms");
      y.terms.forEach(function (t) {
        var section = buildTermSection(t);
        termsWrap.appendChild(section);
        var list = section.querySelector(".course-accordion");
        if (!t.courses.length) {
          var empty = document.createElement("p");
          empty.className = "term-empty";
          empty.textContent = "No courses yet.";
          list.appendChild(empty);
        }
        t.courses.forEach(function (course) { list.appendChild(buildCourseNode(course, openIds)); });
      });
    });
  }

  function buildCourseNode(course, openIds) {
    var courseTpl = document.getElementById("courseTemplate");
    var node = courseTpl.content.firstElementChild.cloneNode(true);
    node.dataset.id = course.id;
    if (openIds.indexOf(course.id) !== -1) node.classList.add("is-open");

    var r = computeCourse(course);

    node.querySelector(".course-name-input").value = course.name;
    var badge = node.querySelector(".letter-badge");
    badge.textContent = r.letter || "—";
    badge.className = "badge letter-badge " + letterClass(r.letter);
    node.querySelector(".course-percent").textContent = percentLabel(course, r);
    node.querySelector(".credit-num").textContent = Number(course.credit) || 0;

    node.querySelector(".credit-input").value = course.credit;
    node.querySelector(".kind-select").value = course.kind;
    node.querySelector(".withdrawn-input").checked = !!course.withdrawn;
    if (course.withdrawn) node.classList.add("is-withdrawn");
    var termSelect = node.querySelector(".term-select");
    state.terms.forEach(function (t) {
      var opt = document.createElement("option");
      opt.value = t.id;
      opt.textContent = termLabel(t);
      termSelect.appendChild(opt);
    });
    termSelect.value = course.termId;
    node.querySelector(".whatif-result").textContent = whatIfMessage(course, Number(node.querySelector(".whatif-target").value) || 80);

    var itemsList = node.querySelector(".items-list");
    var itemRowTpl = document.getElementById("itemRowTemplate");
    (course.items || []).forEach(function (item) {
      var row = itemRowTpl.content.firstElementChild.cloneNode(true);
      row.dataset.itemId = item.id;
      row.querySelector(".item-name").value = item.name;
      row.querySelector(".item-score").value = isGraded(item) ? item.score : "";
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
    if (course.withdrawn) node.querySelector(".whatif-block").style.display = "none";

    return node;
  }

  function percentLabel(course, r) {
    if (course.withdrawn) return "Withdrawn";
    if (course.kind === "satisfactory") return "Pass / fail";
    return r.hasGrades ? Math.round(r.percent) + "%" : "No grades yet";
  }

  function round2(n) {
    return Math.round((Number(n) || 0) * 100) / 100;
  }

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function ghostButton(className, text) {
    var btn = el("button", "btn btn-ghost " + className, text);
    btn.type = "button";
    return btn;
  }

  function buildYearSection(y, canRemove) {
    var section = el("section", "year-section" + (collapsedYears[y.year] ? " is-collapsed" : ""));
    section.dataset.year = y.year;

    var head = el("div", "year-section-head");
    var toggle = el("button", "year-toggle");
    toggle.type = "button";
    toggle.setAttribute("aria-expanded", collapsedYears[y.year] ? "false" : "true");
    toggle.innerHTML = '<svg class="chevron" width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 5l4 4 4-4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    toggle.appendChild(el("span", null, "Year " + y.year));
    head.appendChild(toggle);
    head.appendChild(el("span", "year-section-meta", statsMeta(y.stats)));
    var hasSummer = y.terms.some(function (t) { return t.term.kind === "summer"; });
    if (!hasSummer) head.appendChild(ghostButton("add-summer-btn", "Add summer"));
    if (canRemove) head.appendChild(ghostButton("remove-year-btn", "Remove year"));

    section.appendChild(head);
    section.appendChild(el("div", "year-terms"));
    return section;
  }

  function buildTermSection(t) {
    var section = el("section", "semester-section" + (t.term.kind === "summer" ? " is-summer" : ""));
    section.dataset.term = t.term.id;

    var head = el("div", "semester-section-head");
    head.appendChild(el("span", "semester-name", t.name));
    head.appendChild(el("span", "semester-section-meta", termMeta(t)));
    if (t.term.kind === "summer" && !t.courses.length) head.appendChild(ghostButton("remove-summer-btn", "Remove summer"));
    head.appendChild(ghostButton("add-course-here-btn", "Add course"));

    section.appendChild(head);
    section.appendChild(el("div", "course-accordion"));
    return section;
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
    document.getElementById("creditsRequired").value = state.creditsRequired || "";
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
    var prefersLight = window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches;
    var theme = saved || (prefersLight ? "light" : "dark");
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
      var addHere = e.target.closest(".add-course-here-btn");
      if (addHere) {
        addCourse(addHere.closest(".semester-section").dataset.term);
        return;
      }

      var yearEl = e.target.closest(".year-section");
      if (e.target.closest(".year-toggle")) {
        var yr = Number(yearEl.dataset.year);
        collapsedYears[yr] = !collapsedYears[yr];
        yearEl.classList.toggle("is-collapsed", collapsedYears[yr]);
        e.target.closest(".year-toggle").setAttribute("aria-expanded", collapsedYears[yr] ? "false" : "true");
        return;
      }
      if (e.target.closest(".add-summer-btn")) {
        ensureTerm(state, Number(yearEl.dataset.year), "summer");
        saveState();
        renderAll();
        return;
      }
      if (e.target.closest(".remove-summer-btn")) {
        removeTerms(function (t) { return t.id === e.target.closest(".semester-section").dataset.term; });
        return;
      }
      if (e.target.closest(".remove-year-btn")) {
        var year = Number(yearEl.dataset.year);
        removeTerms(function (t) { return t.year === year; });
        return;
      }

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
        course.items.push({ id: uid(), name: "New item", score: null, full: 0 });
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

    wrap.addEventListener("keydown", function (e) {
      if (e.target.classList.contains("course-summary") && (e.key === "Enter" || e.key === " ")) {
        e.preventDefault();
        e.target.closest(".course").classList.toggle("is-open");
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
        updateCourseLiveTotals(courseEl, course);
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
          if (e.target.classList.contains("item-score")) item2.score = e.target.value === "" ? null : Number(e.target.value) || 0;
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
      if (e.target.classList.contains("withdrawn-input")) {
        course.withdrawn = e.target.checked;
        saveState();
        renderCourses();
        reopen(id);
        renderDashboard();
      }
      if (e.target.classList.contains("term-select")) {
        course.termId = e.target.value;
        saveState();
        renderCourses();
        reopen(id);
        renderDashboard();
      }
    });

    document.getElementById("addCourseBtn").addEventListener("click", function () {
      var year = addYear(state);
      saveState();
      renderAll();
      var yearEl = wrap.querySelector('.year-section[data-year="' + year + '"]');
      if (yearEl) yearEl.scrollIntoView({ behavior: "smooth", block: "start" });
    });

    // Only empty terms can be removed (the buttons are hidden otherwise).
    function removeTerms(match) {
      var doomed = state.terms.filter(match).map(function (t) { return t.id; });
      var inUse = state.courses.some(function (c) { return doomed.indexOf(c.termId) !== -1; });
      if (inUse || doomed.length === state.terms.length) return;
      state.terms = state.terms.filter(function (t) { return doomed.indexOf(t.id) === -1; });
      saveState();
      renderAll();
    }

    function addCourse(termIdValue) {
      var id = uid();
      state.courses.push({
        id: id, name: "New course", credit: 3, kind: "graded",
        termId: termIdValue,
        items: [{ id: uid(), name: "Assignment 1", score: null, full: 100 }],
        scale: [ {cutoff:0,letter:"F"},{cutoff:50,letter:"D"},{cutoff:55,letter:"D+"},{cutoff:60,letter:"C"},{cutoff:65,letter:"C+"},{cutoff:70,letter:"B"},{cutoff:75,letter:"B+"},{cutoff:80,letter:"A"} ]
      });
      saveState();
      renderCourses();
      renderDashboard();
      reopen(id);
      var el = wrap.querySelector('.course[data-id="' + id + '"] .course-name-input');
      if (el) { el.focus(); el.select(); }
    }
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
    courseEl.querySelector(".course-percent").textContent = percentLabel(course, r);
    var badge = courseEl.querySelector(".letter-badge");
    badge.textContent = r.letter || "—";
    badge.className = "badge letter-badge " + letterClass(r.letter);
    var targetInput = courseEl.querySelector(".whatif-target");
    var whatifOut = courseEl.querySelector(".whatif-result");
    if (targetInput && whatifOut) whatifOut.textContent = whatIfMessage(course, Number(targetInput.value) || 80);

    var section = courseEl.closest(".semester-section");
    var yearEl = courseEl.closest(".year-section");
    if (section && yearEl) {
      computeYears().forEach(function (y) {
        if (String(y.year) !== yearEl.dataset.year) return;
        yearEl.querySelector(".year-section-meta").textContent = statsMeta(y.stats);
        y.terms.forEach(function (t) {
          if (t.term.id === section.dataset.term) section.querySelector(".semester-section-meta").textContent = termMeta(t);
        });
      });
    }
  }
  function updateCourseLiveBadge(courseEl, course) {
    updateCourseLiveTotals(courseEl, course);
  }

  /* -------------------------------------------------------
     Event wiring — settings / data
  ------------------------------------------------------- */
  function setupSettings() {
    document.getElementById("creditsRequired").addEventListener("input", function (e) {
      state.creditsRequired = Number(e.target.value) > 0 ? Number(e.target.value) : null;
      saveState();
      renderDashboard();
    });

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
          state = migrate(parsed);
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
        state = migrate(JSON.parse(JSON.stringify(SEED_DATA)));
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
