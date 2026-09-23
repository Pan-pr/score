# Ledger — Grade Dashboard

A personal, interactive GPA dashboard: track courses, credits, and assessment
scores, and see your cumulative GPA update live. Built as a plain static site
(no build step, no backend) so it can be hosted for free on GitHub Pages.

## Put it on GitHub Pages

1. Create a new **public** GitHub repository (e.g. `grades`).
2. Upload these files, keeping the folder structure exactly as-is:
   ```
   index.html
   css/style.css
   js/app.js
   data/seed.json
   ```
3. In the repo, go to **Settings → Pages**.
4. Under **Build and deployment**, set **Source** to `Deploy from a branch`,
   branch `main`, folder `/ (root)`. Save.
5. GitHub gives you a URL like `https://yourname.github.io/grades/` within a
   minute or two. Bookmark it.

You can also just open `index.html` directly in a browser to use it locally
— everything runs client-side.

## How your data is saved

This site has no server or database. Every score, credit, and course you
edit is saved straight to **your browser's local storage**, on the device
and browser you're using — the moment you make a change (watch the "All
changes saved" indicator in the top bar).

That has one important consequence: **your data does not follow you between
browsers or devices**, and clearing your browser's site data will erase it.
To guard against that:

- Use **Settings → Export backup** regularly, or whenever you've made a
  meaningful update. It downloads a `.json` file with everything.
- Use **Settings → Import backup** to restore it — on the same device after
  clearing data, or on a new device/browser.
- **Settings → Reset to sample data** puts back the original example courses
  from the source spreadsheet, in case you want to start over.

If you'd rather your grades sync automatically across devices, that requires
adding a real backend (e.g. a small database + login), which is out of scope
for a static GitHub Pages site — the export/import workflow above is the
practical equivalent for personal use.

## Editing your courses

- **Dashboard** shows your cumulative GPA as a gauge, plus quick stats and a
  live standings list for every course.
- **Courses** is where you do the actual editing. Click a course to expand
  it:
  - Rename it, set its credit value, or mark it "Satisfactory / Ungraded"
    (for pass/fail courses like a Gen-Ed elective — these are shown but
    excluded from the GPA calculation).
  - Add, edit, or remove assessment items (name, score, out of). The total
    and percentage update as you type.
  - Edit the grading scale used to convert that course's percentage into a
    letter grade — each course can have its own cutoffs, matching how the
    original spreadsheet had different scales per course.
- **Settings** lets you change the GPA point value assigned to each letter
  grade (defaults to a standard 8-point scale, A = 4.0 down to F = 0), plus
  the backup tools described above.

## A fix made from your original spreadsheet

Your source file had two sections both labeled "Comm Eng" — one was clearly
the real Comm Eng course, and the other (Group Activity, Quiz Intro to
Cluster, Teamwork, Assignment, Attendance) matched the credit and position
of "Explore" in your summary table, which had no detail section of its own.
That second section has been renamed to **Explore** here. Everything is
editable, so rename anything back if this guess doesn't match your intent.
