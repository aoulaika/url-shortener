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

const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours
const cacheKey = (shortCode: string) => `url_${shortCode}`;

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

  async createShortUrl({ longUrl }: CreateUrlDto) {
    return this.urlRepository.manager.transaction(async (manager) => {
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

      await manager.save(Url, { id: savedUrl.id, shortCode });

      return {
        longUrl,
        shortUrl: `${this.baseUrl}/${shortCode}`,
      };
    });
  }

  async getLongUrl(shortCode: string) {
    return this.urlRepository.manager.transaction(async (manager) => {
      const url = await manager.findOne(Url, {
        select: { id: true, longUrl: true },
        where: { shortCode },
        cache: {
          id: cacheKey(shortCode),
          milliseconds: CACHE_TTL,
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
    await this.urlRepository.manager.transaction(async (manager) => {
      await manager.delete(Url, { shortCode });
      await manager.connection.queryResultCache?.remove([cacheKey(shortCode)]);
    });
  }
}
