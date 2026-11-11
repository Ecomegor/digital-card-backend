export interface ExperienceRecord {
  id: string;
  profileId: string;
  company: string;
  position: string;
  startDate: Date;
  endDate: Date | null;
  achievements: string[];
}

export interface Experience extends ExperienceRecord {
  period: string;
}
