import { Controller, Post, Get, Put, Delete, Param, Body, UseGuards, Req, UnauthorizedException, Res } from '@nestjs/common';
import type { Response } from 'express';
import * as jwt from 'jsonwebtoken';
import { ShortenUrlDto } from './dto/shorten-url.dto';
import { UpdateUrlDto } from './dto/update-url.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { ShortenService } from './shorten.service';

@Controller()
export class ShortenController {
	constructor(private readonly shortenService: ShortenService) {}

	// Public: Shorten URL (anonymous or authenticated)
	@Post('shorten')
	async shortenUrl(@Body() dto: ShortenUrlDto, @Req() request) {
		// Check for Authorization header
		const authHeader = request.headers['authorization'] || request.headers['Authorization'];

		let ownerId: string | undefined = undefined;

		if (authHeader) {
			const token = authHeader.replace(/^Bearer\s+/i, '');
			try {
				const secret = process.env.JWT_SECRET || 'changeme';
				const payload = jwt.verify(token, secret) as { sub?: string };
				ownerId = typeof payload.sub === 'string' ? payload.sub : undefined;
			} catch (err) {
				throw new UnauthorizedException('Invalid or expired token');
			}
		}

		const shortUrl = await this.shortenService.createShortUrl(dto, ownerId);
		return shortUrl;
	}

	// Protected: List user's URLs (MUST come before /:short to avoid route conflict)
	@Get('my-urls')
	@UseGuards(AuthGuard)
	async listMyUrls(@Req() request) {
		const userId = request.user.sub;
		return this.shortenService.listUserUrls(userId);
	}

	// Protected: Update URL
	@Put('my-urls/:id')
	@UseGuards(AuthGuard)
	async updateUrl(@Param('id') id: string, @Body() dto: UpdateUrlDto, @Req() request) {
		const userId = request.user.sub;
		return this.shortenService.updateUserUrl(id, userId, dto.originalUrl);
	}

	// Protected: Soft delete URL
	@Delete('my-urls/:id')
	@UseGuards(AuthGuard)
	async deleteUrl(@Param('id') id: string, @Req() request, @Res() res: Response) {
		const userId = request.user.sub;
		await this.shortenService.softDeleteUserUrl(id, userId);
		return res.status(204).send();
	}

	// Public: Redirect and count access (MUST come after /my-urls to avoid catching it)
	@Get(':short')
	async redirect(@Param('short') short: string, @Res() res: Response) {
		const originalUrl = await this.shortenService.findAndIncrementAccess(short);
		return res.redirect(302, originalUrl);
	}
}
