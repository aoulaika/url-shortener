import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';
import type { CreateUrlDto } from './dto/create-url.dto';
import { Url } from './entities/url.entity';
import { UrlShortenerService } from './url-shortener.service';

@Injectable()
export class UrlService {
  private readonly baseUrl = (
    process.env.BASE_URL || 'http://localhost:3000'
  ).replace(/\/$/, '');

  constructor(
    @InjectRepository(Url)
    private urlRepository: Repository<Url>,
    private urlShortenerService: UrlShortenerService,
  ) {}

  async createShortUrl(createUrlDto: CreateUrlDto) {
    return this.urlRepository.manager.transaction(async (manager) => {
      const { longUrl } = createUrlDto;
      const urlExists = await manager.exists(Url, {
        where: { longUrl },
      });

      if (urlExists) {
        throw new ConflictException('URL already exists');
      }

      const savedUrl = await manager.save(Url, { longUrl });
      const shortCode = this.urlShortenerService.generateUniqueShortCode(
        savedUrl.id,
      );

      savedUrl.shortCode = shortCode;
      await manager.save(Url, savedUrl);

      return {
        longUrl: savedUrl.longUrl,
        shortUrl: `${this.baseUrl}/${savedUrl.shortCode}`,
      };
    });
  }

  async getLongUrl(shortCode: string) {
    return this.urlRepository.manager.transaction(async (manager) => {
      const url = await manager.findOne(Url, {
        select: { id: true, longUrl: true },
        where: { shortCode },
        cache: {
          id: `url_longUrl_${shortCode}`,
          milliseconds: 24 * 60 * 60 * 1000, // 24 hours
        },
      });

      if (!url) {
        throw new NotFoundException('URL not found');
      }

      await manager.increment(Url, { id: url.id }, 'clicks', 1);
      return url.longUrl;
    });
  }

  async getStats(shortCode: string) {
    const stats = await this.urlRepository.findOne({
      where: { shortCode },
    });
    if (!stats) {
      throw new NotFoundException('URL not found');
    }
    return {
      shortCode: stats.shortCode,
      shortUrl: `${this.baseUrl}/${stats.shortCode}`,
      longUrl: stats.longUrl,
      clicks: stats.clicks,
      createdAt: stats.createdAt,
    };
  }

  async deleteUrl(shortCode: string) {
    await this.urlRepository.delete({ shortCode });
  }
}
