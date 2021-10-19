export interface ConsumerAppService {
  getWelcome: (name: string) => string;
  licenseState: () => any;
}