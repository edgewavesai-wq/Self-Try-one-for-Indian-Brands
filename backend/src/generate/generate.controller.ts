import {
  Controller,
  Post,
  UploadedFiles,
  UseInterceptors,
  Body,
  BadRequestException,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { GenerateService } from './generate.service';

@Controller('generate')
export class GenerateController {
  constructor(private readonly generateService: GenerateService) {}

  @Post()
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'userPhoto', maxCount: 1 },
      { name: 'fabricPhoto', maxCount: 1 },
      { name: 'styleRefPhoto', maxCount: 1 },
    ]),
  )
  async generate(
    @UploadedFiles()
    files: {
      userPhoto?: Express.Multer.File[];
      fabricPhoto?: Express.Multer.File[];
      styleRefPhoto?: Express.Multer.File[];
    },
    @Body('selections') selectionsRaw: string,
  ) {
    if (!files?.userPhoto?.[0]) {
      throw new BadRequestException('User photo is required');
    }
    if (!selectionsRaw) {
      throw new BadRequestException('Selections are required');
    }

    const selections = JSON.parse(selectionsRaw);

    return this.generateService.generate(
      files.userPhoto[0],
      files.fabricPhoto?.[0],
      files.styleRefPhoto?.[0],
      selections,
    );
  }
}
