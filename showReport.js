async function showReport(reportUrl) {
  const HIDDEN_CLASS = "hidden";
  const GRADE_TEXT = "Grade";
  const SCORE_TEXT = "Avg";

  const grade = document.querySelector(".grade");
  const score = document.querySelector(".score");
  const errorDisplay = document.querySelector(".error");

  try {
    const response = await fetch(reportUrl);
    if (!response.ok) {
      throw new Error(
        `Problem fetching report from S3. Status text: "${response.statusText}"`
      );
    }
    const report = await response.json();
    const headings = report.rows[0];

    const indexOfColumnWithGrade = headings.findIndex(
      column => column === GRADE_TEXT
    );
    const indexOfColumnWithScore = headings.findIndex(
      column => column === SCORE_TEXT
    );
    if (indexOfColumnWithGrade < 0 || indexOfColumnWithScore < 0) {
      throw new Error(
        `Spreadsheet must contain the headings "${GRADE_TEXT}" and "${SCORE_TEXT}".`
      );
    }

    const nonEmptyRows = report.rows.filter(row => {
      return typeof row[indexOfColumnWithGrade] !== "undefined";
    });
    if (!nonEmptyRows.length) {
      throw new Error("The spreadsheet doesn't contain any rows with grades.");
    }
    const mostRecentRow = nonEmptyRows[nonEmptyRows.length - 1];

    grade.textContent = mostRecentRow[indexOfColumnWithGrade];
    score.textContent = mostRecentRow[indexOfColumnWithScore];
  } catch (error) {
    grade.classList.add(HIDDEN_CLASS);
    score.classList.add(HIDDEN_CLASS);
    errorDisplay.classList.remove(HIDDEN_CLASS);

    errorDisplay.querySelector(".about-error").textContent = `Error: ${
      error.message
    }`;
  }
}
showReport("./report.json");
