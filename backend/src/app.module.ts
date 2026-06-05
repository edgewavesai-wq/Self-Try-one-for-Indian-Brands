import { Module } from '@nestjs/common';
import { GenerateModule } from './generate/generate.module';

@Module({
  imports: [GenerateModule],
})
export class AppModule {}
