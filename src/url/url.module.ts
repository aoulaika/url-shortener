import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Url } from './entities/url.entity';
import { UrlController } from './url.controller';
import { UrlService } from './url.service';
import { UrlShortenerService } from './url-shortener.service';

@Module({
  imports: [TypeOrmModule.forFeature([Url])],
  controllers: [UrlController],
  providers: [UrlShortenerService, UrlService],
})
export class UrlModule {}
