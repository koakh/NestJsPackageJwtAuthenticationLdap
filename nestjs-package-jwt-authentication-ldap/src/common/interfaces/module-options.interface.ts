import { ConsumerAppService } from "./consumer-app-service.interface";
import { ModuleOptionsConfig } from "./module-options-config.interface";

export interface ModuleOptions {
  consumerAppService: ConsumerAppService;
  // optional configService environment variables
  config: ModuleOptionsConfig,
}
