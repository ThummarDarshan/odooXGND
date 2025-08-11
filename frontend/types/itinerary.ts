export type Activity = {
  id: string;
  name: string;
  time: string;
  cost?: number;
};

export type Stop = {
  id: string;
  city: string;
  startDate: Date;
  endDate: Date;
  activities: Activity[];
  budget?: string;
  info?: string;
};
