// Fitbit will give you an auth url when you register your app
export const authorizationURL = 'https://www.fitbit.com/oauth2/authorize?response_type=token&client_id=22DQ3V&redirect_uri=https%3A%2F%2Finternal-scorecard.s3.amazonaws.com%2Findex.html&scope=activity%20heartrate%20location%20nutrition%20profile%20settings%20sleep%20social%20weight&expires_in=604800';
  
document.querySelector('.authorize-fitbit').addEventListener('click', () => {
  window.location.href = authorizationURL;
});

type PlainFlatObject = {
  [property: string]: string|number
};

const localDb = {
  save(key: string, value: PlainFlatObject) {
    window.localStorage.setItem(key, JSON.stringify(value));
  },
  get(key: string): PlainFlatObject {
    const stored = window.localStorage.getItem(key);
    return stored ? JSON.parse(stored) : {};
  }
};

type OauthResponse = {
  access_token?: string;
};

export type FitbitSleepLevel = {
  level: string;
  seconds: number;
};

export type FitbitSleepDay = {
  dateOfSleep: string;
  levels: {
    data: Array<FitbitSleepLevel>
  };
};

export type FitBitSleepResponse = {
  sleep: Array<FitbitSleepDay>
};

export default class Fitbit {
  oauthResponse: OauthResponse;

  constructor() {
    const OAUTH_RESPONSE_KEY = 'oauthResponse';
    const authDataInURL = Fitbit.parseAuthorizationResponse(window.location.hash);
    if (authDataInURL.access_token) {
      localDb.save(OAUTH_RESPONSE_KEY, authDataInURL);
    }
    this.oauthResponse = localDb.get(OAUTH_RESPONSE_KEY);
  }

  static getDateString(date: Date): string {
    return [
      date.getFullYear(),
      date.getMonth() + 1,
      date.getDate()
    ].map(dateSegment => {
      return dateSegment < 10 ? `0${dateSegment}` : String(dateSegment);
    }).join('-');
  }

  static parseAuthorizationResponse(urlHashResponse: string): PlainFlatObject {
    const params = urlHashResponse.split('&');
    params[0] = params[0].replace('#', '');

    return params.reduce((result: PlainFlatObject, string) => {
      const [key, value] = string.split('=');
      result[key] = value;
      return result;
    }, {});
  }

  authorize() {
    window.location.href = authorizationURL;
  }

  isAuthorized(): boolean {
    return !!this.oauthResponse.access_token;
  }

  getProfile(): Promise<FitBitSleepResponse> {
    return this.request('https://api.fitbit.com/1/user/-/profile.json');
  }

  getSleepThisWeek(): Promise<FitBitSleepResponse> {
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

  getSleep(year: string, month: string, day: string) {
    const dateString = [year, month, day].join('-');
    return this.request(`https://api.fitbit.com/1.2/user/-/sleep/date/${dateString}.json`);
  }
  
  request(url: string, method = 'GET') {
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

export const getSecondsOfDeepSleepForDay = (daySleepData: FitbitSleepDay) => {
  const { levels: { data } } = daySleepData;
  const relevantSleepLevels = new Set(['deep']);
  return data
    .filter(({level }) => relevantSleepLevels.has(level))
    .reduce((totalSeconds: number, { seconds }) => totalSeconds + seconds, 0);
};

export const convertSecondsToHoursForDisplay = (seconds: number): string => (seconds / (60 * 60)).toFixed(1);

/*
async function initFitbitReport() {
  const fitbitInfo = document.querySelector('.fitbit-report');
  const fitbit = new Fitbit();

  if (!fitbit.isAuthorized()) {
    fitbitInfo.querySelector('.authorize-fitbit').classList.remove('hidden');
    return Promise.reject();
  }

  try {
    const response: FitBitSleepResponse = await fitbit.getSleepThisWeek();

    const averageSecondsAsleepThisWeek = response.sleep.reduce((total: number, day: FitbitSleepDay): number => {
      const seconds: number = getSecondsOfDeepSleepForDay(day);
      return total + seconds;
    }, 0) / response.sleep.length;

    const hoursAsleepThisWeek: string = convertSecondsToHoursForDisplay(averageSecondsAsleepThisWeek);
    document.querySelector('.fitbit-report').textContent = `Your deep/REM sleep averages ${hoursAsleepThisWeek}hrs. this week`;
  } catch (error) {
    document.querySelector('.authorize-fitbit').classList.remove('hidden');
    return Promise.reject();
  }

  return Promise.resolve();
}

initFitbitReport();
*/
