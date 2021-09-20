import { Test, TestingModule } from '@nestjs/testing';
import { ConsumerAppService } from './consumer-app.service';

describe('ConsumerAppService', () => {
  let service: ConsumerAppService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ConsumerAppService],
    }).compile();

    service = module.get<ConsumerAppService>(ConsumerAppService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
