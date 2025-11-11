import { Controller, Post, Get, Put, Delete, Param, Body, UseGuards, Req } from '@nestjs/common';
import { ShortenUrlDto } from './dto/shorten-url.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { ShortenService } from './shorten.service';

@Controller()
export class ShortenController {
	constructor(private readonly shortenService: ShortenService) {}
	// Public: Shorten URL (anonymous or authenticated)
		@Post('shorten')
		async shortenUrl(@Body() dto: ShortenUrlDto, @Req() request) {
			const ownerId = request.user?.sub;
			const shortUrl = await this.shortenService.createShortUrl(dto, ownerId);
			return shortUrl;
		}

	// Public: Redirect and count access
	@Get(':short')
	async redirect(@Param('short') short: string) {
		// TODO: Implement redirect
		return `redirect ${short}`;
	}

	// Protected: List user's URLs
	@Get('my-urls')
	@UseGuards(AuthGuard)
	async listMyUrls() {
		// TODO: Implement listing
		return 'listMyUrls';
	}

	// Protected: Update original URL
	@Put('my-urls/:id')
	@UseGuards(AuthGuard)
	async updateUrl(@Param('id') id: string, @Body() body: any) {
		// TODO: Implement update
		return `updateUrl ${id}`;
	}

	// Protected: Soft delete URL
	@Delete('my-urls/:id')
	@UseGuards(AuthGuard)
	async deleteUrl(@Param('id') id: string) {
		// TODO: Implement soft delete
		return `deleteUrl ${id}`;
	}
}
