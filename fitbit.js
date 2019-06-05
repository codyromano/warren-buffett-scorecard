class Fitbit {
  // Fitbit will give you an auth url when you register your app
  static authorizationURL = 'https://www.fitbit.com/oauth2/authorize?response_type=token&client_id=22DQ3V&redirect_uri=https%3A%2F%2Finternal-scorecard.s3.amazonaws.com%2Findex.html&scope=activity%20heartrate%20location%20nutrition%20profile%20settings%20sleep%20social%20weight&expires_in=604800';
  
  constructor() {
    this.oauthResponse = Fitbit.parseAuthorizationResponse(window.location.hash);
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
    window.location.href = Fitbit.authorizationURL;
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
  const fitbit = new Fitbit();
  // const view = new FitbitAppView(document.body);

  if (!fitbit.isAuthorized()) {
    fitbit.authorize();
    return Promise.reject();
  }

  try {
    const response = await fitbit.getSleepThisWeek();
    // const { sleep: [ lastNight ] } = response; 
    // view.renderSleepReport(lastNight.minutesAsleep);
    console.log('sleep this week: ', response);
  } catch (error) {
    // view.renderError('Sorry, there was a problem accessing the Fitbit API.');
    return Promise.reject();
  }

  return Promise.resolve();
}

initFitbitReport();
