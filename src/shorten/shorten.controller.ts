import { Controller, Post, Get, Put, Delete, Param, Body, UseGuards, Req } from '@nestjs/common';
import { ShortenUrlDto } from './dto/shorten-url.dto';
import { AuthGuard } from '../auth/guards/auth.guard';

@Controller()
export class ShortenController {
	// Public: Shorten URL (anonymous or authenticated)
	@Post('shorten')
	async shortenUrl(@Body() dto: ShortenUrlDto, @Req() request) {
			// Check if user is authenticated
			if (request.user) {
				// Authenticated user: associate shortened URL with user
				// TODO: Implement logic for authenticated user
				return { ...dto, ownerId: request.user.sub };
			}
			else {
				// Anonymous user: create shortened URL without owner
				// TODO: Implement logic for anonymous user
				return { ...dto, ownerId: null };
			}
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
