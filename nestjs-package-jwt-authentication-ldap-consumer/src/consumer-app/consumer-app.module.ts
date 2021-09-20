import { Module } from '@nestjs/common';
import { ConsumerAppService } from './consumer-app.service';

@Module({
  providers: [ConsumerAppService],
  // TODO: important without this we always have the infamous error
  // [ExceptionHandler] Nest can't resolve dependencies of the Symbol(AUTH_OPTIONS) (ConfigService, ?). Please make sure that the argument ConsumerAppService at index [1] is available in the AuthModule context.

  // Potential solutions:
  // - If ConsumerAppService is a provider, is it part of the current AuthModule?
  // - If ConsumerAppService is exported from a separate @Module, is that module imported within AuthModule?
  //   @Module({
  //     imports: [ /* the Module containing ConsumerAppService */ ]
  //   })  
  exports: [ConsumerAppService],
})
export class ConsumerAppModule {}
