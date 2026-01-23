import {
  Controller,
  Post,
  Body,
  Get,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';

class GetNonceDto {
  address: string;
}

class VerifySignatureDto {
  message: string;
  signature: string;
}

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('nonce')
  @ApiOperation({ summary: 'Get a nonce for SIWE authentication' })
  @ApiResponse({ status: 200, description: 'Returns a random nonce' })
  async getNonce() {
    const nonce = await this.authService.generateNonce();
    return { nonce };
  }

  @Post('verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify SIWE signature and get JWT token' })
  @ApiResponse({ status: 200, description: 'Returns JWT token and user info' })
  @ApiResponse({ status: 401, description: 'Invalid signature' })
  async verify(@Body() dto: VerifySignatureDto) {
    const { address } = await this.authService.verifySignature(
      dto.message,
      dto.signature,
    );
    return this.authService.login(address);
  }
}
