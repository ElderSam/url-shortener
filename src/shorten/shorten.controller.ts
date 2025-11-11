import { Controller, Post, Get, Put, Delete, Param, Body, UseGuards, ValidationPipe, UsePipes } from '@nestjs/common';
import { ShortenUrlDto } from './dto/shorten-url.dto';
import { AuthGuard } from '../auth/guards/auth.guard';

@Controller()
export class ShortenController {
	// Public: Shorten URL (anonymous or authenticated)
	@Post('shorten')
	async shortenUrl(@Body(ValidationPipe) dto: ShortenUrlDto) {
		// TODO: Implement shortening
		return dto;
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
