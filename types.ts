
export interface Service {
  id: string;
  title: string;
  description: string;
  status: 'ONLINE' | 'MAINTENANCE' | 'DEVELOPING';
  version: string;
}

export interface TerminalLine {
  text: string;
  type: 'info' | 'error' | 'success' | 'command';
  timestamp: string;
}

export interface Inquiry {
  id: number;
  name: string;
  budget: string;
  details: string;
  date: string;
  status: 'NEW' | 'PENDING' | 'RESOLVED';
}

export interface SiteConfig {
  // Header
  companyName: string;
  slogan: string;
  subLabel: string;
  
  // Terminal & Buttons
  terminalTitle: string;
  welcomeMessage: string;
  inquiryBtnText: string;
  adminBtnText: string;
  
  // Section Titles
  metricsTitle: string;
  modulesTitle: string;
  missionTitle: string;
  
  // Mission Content
  missionMainText: string;
  missionQuote: string;
  missionSubText: string;
  
  // Footer
  footerText: string;
}
