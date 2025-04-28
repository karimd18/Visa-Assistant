export type MessageType = {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  file?: File | null;
};

export type VisaRequirementType = 'VISA EXEMPT' | 'VISA ON ARRIVAL' | 'APPLY FOR VISA OFFLINE' | null;

export type VisaInfoType = {
  country: string;
  requirement: VisaRequirementType;
};