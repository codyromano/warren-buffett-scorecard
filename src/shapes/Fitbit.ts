type FitbitWeightEntry = {
  bmi: number;
  date: string;
  logId: number;
  time: string;
  weight: number;
  source: string;
};

export type FitbitWeightResponse = {
  weight: FitbitWeightEntry[];
};

export type FitbitShape = {
  isAuthorized: Function;
  getSleepThisWeek: Function;
  getWeight: () => Promise<FitbitWeightResponse>;
  authorize: Function;
};