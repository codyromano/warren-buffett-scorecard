class ScorecardView {
  constructor(root) {
    this.report = root.querySelector(".report");
    this.gradeText = root.querySelector(".grade");
    this.scoreText = root.querySelector(".score");
    this.signIn = root.querySelector(".sign-in");
    this.signOut = root.querySelector(".sign-out");
    this.error = root.querySelector(".error");
    this.errorText = root.querySelector(".about-error");
    this.congrats = root.querySelector(".congrats");
  }
  static hide(node) {
    node.classList.add("hidden");
  }
  static show(node) {
    node.classList.remove("hidden");
  }
  hideScoreCard() {
    this.gradeText.textContent = "-";
    this.scoreText.textContent = "-";

    ScorecardView.show(this.signIn);
    ScorecardView.hide(this.signOut);
    ScorecardView.hide(this.report);
  }
  showScoreCard(grade, score) {
    if (grade.toLowerCase().includes("a")) {
      ScorecardView.show(this.congrats);
    }
    this.gradeText.textContent = grade;
    this.scoreText.textContent = score;

    ScorecardView.hide(this.signIn);
    ScorecardView.show(this.signOut);
    ScorecardView.show(this.report);
  }
  showError(message) {
    this.errorText.textContent = message;
    ScorecardView.show(this.error);
  }
}

const view = new ScorecardView(document.querySelector("main"));

// Client ID and API key from the Developer Console
const CLIENT_ID =
  "258829500579-eljfedk4fml3nnanod3cmf9dug5lnd1e.apps.googleusercontent.com";
const API_KEY = "AIzaSyA1LN_NCID1C2f2MInHValrjU3fJBZxOTg";

// Array of API discovery doc URLs for APIs used by the quickstart
const DISCOVERY_DOCS = [
  "https://sheets.googleapis.com/$discovery/rest?version=v4"
];

// Authorization scopes required by the API; multiple scopes can be
// included, separated by spaces.
const SCOPES = "https://www.googleapis.com/auth/spreadsheets.readonly";

const authorizeButton = view.signIn;
const signoutButton = view.signOut;

/**
 *  On load, called to load the auth2 library and API client library.
 */
function handleClientLoad() {
  gapi.load("client:auth2", initClient);
}

/**
 *  Initializes the API client library and sets up sign-in state
 *  listeners.
 */
function initClient() {
  gapi.client
    .init({
      apiKey: API_KEY,
      clientId: CLIENT_ID,
      discoveryDocs: DISCOVERY_DOCS,
      scope: SCOPES
    })
    .then(
      function() {
        // Listen for sign-in state changes.
        gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);

        // Handle the initial sign-in state.
        updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
        authorizeButton.onclick = handleAuthClick;
        signoutButton.onclick = handleSignoutClick;
      },
      function(error) {
        appendPre(JSON.stringify(error, null, 2));
      }
    );
}

/**
 *  Called when the signed in status changes, to update the UI
 *  appropriately. After a sign-in, the API is called.
 */
async function updateSigninStatus(isSignedIn) {
  if (isSignedIn) {
    const { score, grade } = await getScorecardMetrics();
    view.showScoreCard(grade, score);
  } else {
    view.hideScoreCard();
  }
}

/**
 *  Sign in the user upon button click.
 */
function handleAuthClick(event) {
  gapi.auth2.getAuthInstance().signIn();
}

/**
 *  Sign out the user upon button click.
 */
function handleSignoutClick(event) {
  gapi.auth2.getAuthInstance().signOut();
}

/**
 * Append a pre element to the body containing the given message
 * as its text node. Used to display the results of the API call.
 *
 * @param {string} message Text to be placed in pre element.
 */
function appendPre(message) {
  view.showError(message);
}

function displayScorecardMetrics(score, grade) {
  document.querySelector(".score").textContent = score;
  document.querySelector(".grade").textContent = grade;
}

async function getScorecardMetrics() {
  try {
    const response = await gapi.client.sheets.spreadsheets.values.get({
      spreadsheetId: "1AxA05tYZ1A5fzPQvqgIroOJQc39Q-aWBYFn0Ic33nP4",
      range: "Scorecard!A1:H"
    });
    const {
      result: { values: rows }
    } = response;

    const GRADE_HEADER_TEXT = "Grade";
    const SCORE_HEADER_TEXT = "Avg";

    const headings = rows[0];
    const gradeIndex = headings.findIndex(col => col === GRADE_HEADER_TEXT);
    const avgScoreIndex = headings.findIndex(col => col === SCORE_HEADER_TEXT);

    if (gradeIndex < 0 || avgScoreIndex < 0) {
      throw new Error(`Spreadsheet must contain columns with the headings
        ${GRADE_HEADER_TEXT} and ${SCORE_HEADER_TEXT}.`);
    }

    const [mostRecentRow] = rows
      .filter(row => row.length === headings.length)
      .slice(-1);

    if (!mostRecentRow) {
      throw new Error("Spreadsheet has no completely filled-out rows");
    }
    const [score, grade] = mostRecentRow.slice(-2);
    return Promise.resolve({ score, grade });
  } catch (error) {
    appendPre("Problem fetching data from Google Sheets: " + error.message);
    console.error(error);
  }
}
