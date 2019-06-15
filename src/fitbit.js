// Fitbit will give you an auth url when you register your app
const authorizationURL = 'https://www.fitbit.com/oauth2/authorize?response_type=token&client_id=22DQ3V&redirect_uri=https%3A%2F%2Finternal-scorecard.s3.amazonaws.com%2Findex.html&scope=activity%20heartrate%20location%20nutrition%20profile%20settings%20sleep%20social%20weight&expires_in=604800';
  

document.querySelector('.authorize-fitbit').addEventListener('click', () => {
  window.location.href = authorizationURL;
});

const localDb = {
  save(key, value) {
    window.localStorage.setItem(key, JSON.stringify(value));
  },
  get(key) {
    const stored = window.localStorage.getItem(key);
    return stored ? JSON.parse(stored) : {};
  }
};

class Fitbit {
  constructor() {
    const OAUTH_RESPONSE_KEY = 'oauthResponse';

    // https://internal-scorecard.s3.amazonaws.com/index.html
    const authDataInURL = Fitbit.parseAuthorizationResponse(window.location.hash);
    if (authDataInURL.access_token) {
      localDb.save(OAUTH_RESPONSE_KEY, authDataInURL);
    }
    this.oauthResponse = localDb.get(OAUTH_RESPONSE_KEY);
  }

  static getDateString(date) {
    return [
      date.getFullYear(),
      date.getMonth() + 1,
      date.getDate()
    ].map(dateSegment => {
      return dateSegment < 10 ? `0${dateSegment}` : String(dateSegment);
    }).join('-');
  }

  static parseAuthorizationResponse(urlHashResponse) {
    const params = urlHashResponse.split('&');
    params[0] = params[0].replace('#', '');

    return params.reduce((result, string) => {
      const [key, value] = string.split('=');
      result[key] = value;
      return result;
    }, {});
  }

  authorize() {
    window.location.href = authorizationURL;
  }

  isAuthorized() {
    return !!this.oauthResponse.access_token;
  }

  getProfile() {
    return this.request('https://api.fitbit.com/1/user/-/profile.json');
  }

  getSleepThisWeek() {
    const endDateString = Fitbit.getDateString(new Date())
    let mondayOfThisWeek = new Date();

    while (mondayOfThisWeek.getDay() !== 1) {
      mondayOfThisWeek.setUTCHours(-24);
    }
    const startDateString = Fitbit.getDateString(mondayOfThisWeek);

    if (endDateString === startDateString) {
      return this.request(`https://api.fitbit.com/1.2/user/-/sleep/date/${startDateString}.json`);
    }
    return this.request(`https://api.fitbit.com/1.2/user/-/sleep/date/${startDateString}/${endDateString}.json`);
  }

  getSleep(year, month, day) {
    const dateString = [year, month, day].join('-');
    return this.request(`https://api.fitbit.com/1.2/user/-/sleep/date/${dateString}.json`);
  }
  
  request(url, method = 'GET') {
    if (!this.isAuthorized()) {
      return Promise.reject('You must authorize before making a request!');
    }
    return window.fetch(url, {
      method,
      headers: {
        'Authorization': `Bearer ${this.oauthResponse.access_token}`
      }
    }).then(response => response.json());
  }
}

async function initFitbitReport() {
  const fitbitInfo = document.querySelector('.fitbit-report');
  const fitbit = new Fitbit();

  if (!fitbit.isAuthorized()) {
    fitbitInfo.querySelector('.authorize-fitbit').classList.remove('hidden');
    return Promise.reject();
  }

  try {
    const response = await fitbit.getSleepThisWeek();
    const totalMinutesAsleep = response.sleep.reduce((total, logEntry) => {
      return logEntry.minutesAsleep + total;
    }, 0) / response.sleep.length;

    const timeAlseepForDisplay = (totalMinutesAsleep / 60).toFixed(2);
    document.querySelector('.fitbit-report').textContent = `${timeAlseepForDisplay} avg. sleep time`;
  } catch (error) {
    document.querySelector('.authorize-fitbit').classList.remove('hidden');
    return Promise.reject();
  }

  return Promise.resolve();
}

initFitbitReport();
