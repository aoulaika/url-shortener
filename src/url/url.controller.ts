import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Res,
} from '@nestjs/common';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiParam,
  ApiPermanentRedirectResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { CreateUrlDto } from './dto/create-url.dto';
import { UrlService } from './url.service';

@Controller()
@ApiTags('url-shortener')
export class UrlController {
  constructor(private readonly urlService: UrlService) {}

  @Post('shorten')
  @ApiCreatedResponse({
    description: 'The URL has been successfully shortened.',
    schema: {
      example: {
        shortUrl: 'http://localhost:3000/a1B2c31',
        longUrl: 'https://www.example.com/some/long/url',
      },
    },
  })
  @ApiBody({
    type: CreateUrlDto,
    examples: {
      valid: {
        summary: 'Valid URL',
        value: { longUrl: 'https://www.example.com/some/long/url' },
      },
      invalid: {
        summary: 'Invalid URL',
        value: { longUrl: 'invalid-url' },
      },
    },
  })
  async createShortUrl(@Body() createUrlDto: CreateUrlDto) {
    return this.urlService.createShortUrl(createUrlDto);
  }

  @Get(':shortCode')
  @ApiPermanentRedirectResponse({
    description: 'Redirects to the original long URL.',
  })
  @ApiParam({ name: 'shortCode', type: 'string', example: 'a1B2c31' })
  async redirect(@Param('shortCode') shortCode: string, @Res() res: Response) {
    const longUrl = await this.urlService.getLongUrl(shortCode);
    return res.redirect(HttpStatus.MOVED_PERMANENTLY, longUrl);
  }

  @Get('stats/:shortCode')
  @ApiOkResponse({
    description: 'Retrieves statistics for the given short URL.',
    schema: {
      example: {
        shortCode: 'a1B2c31',
        shortUrl: 'http://localhost:3000/a1B2c31',
        longUrl: 'https://www.example.com/some/long/url',
        clicks: 42,
        createdAt: '2024-06-15T12:34:56.789Z',
      },
    },
  })
  @ApiParam({ name: 'shortCode', type: 'string', example: 'a1B2c31' })
  async getStats(@Param('shortCode') shortCode: string) {
    return await this.urlService.getStats(shortCode);
  }

  @Delete(':shortCode')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse({
    description: 'The URL has been successfully deleted.',
  })
  @ApiParam({ name: 'shortCode', type: 'string', example: 'a1B2c31' })
  async deleteUrl(@Param('shortCode') shortCode: string) {
    await this.urlService.deleteUrl(shortCode);
  }
}
