import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
  UseInterceptors,
  UseFilters,
  Req,
  Request,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiTags,
} from "@nestjs/swagger";

import { AuthUser } from "../../decorators/auth-user.decorator";
import { AuthGuard } from "../../guards/auth.guard";
import { AuthUserInterceptor } from "../../interceptors/auth-user-interceptor.service";
import { UserDto } from "../../service-users/user/dto/UserDto";
import { UserEntity } from "../../service-users/user/user.entity";
import { AuthService } from "./auth.service";
import { LoginPayloadDto } from "./dto/LoginPayloadDto";
import { UserLoginDto } from "./dto/UserLoginDto";
import {
  UserRegisterDto,
  adminRegisterSwagger,
  useregisterSwagger,
} from "./dto/UserRegisterDto";
import { ResponseSuccess } from "../../common/dto/SuccessResponseDto";
import { ValidationPipe } from "../../common/pipes/validation.pipe";
import {
  UserForgotPasswordDto,
  userResetPasswordSwagger,
} from "./dto/UserForgotPasswordDto";
import { ExceptionResponseFilter } from "../../common/filters/exception-response.filter";
import { UserEmailVerifyDto } from "./dto/UserEmailVerifyDto";
import { UserCreateService } from "../../service-users/user/services/create.service";
import { UserUpdateService } from "../../service-users/user/services/update.service";
import { PermissionService } from "../../service-permission/permission.service";
import { MyProfilePayloadDto } from "./dto/MyProfilePayloadDto";
import { UserReadService } from "../../service-users/user/services/read.service";
import { tokenSwagger } from "./dto/TokenPayloadDto";

@Controller("auth")
@ApiTags("auth")
@UseFilters(ExceptionResponseFilter)
export class AuthController {
  constructor(
    public readonly authService: AuthService,
    public readonly userUpdateService: UserUpdateService,
    public readonly userCreateService: UserCreateService,
    public readonly userReadService: UserReadService,
    public readonly permissionService: PermissionService,
  ) { }

  /**
   * User Login
   */

  @Post("login")
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    type: LoginPayloadDto,
    description: "User info with access token",
  })
  async userLogin(
    @Body(new ValidationPipe()) userLoginDto: UserLoginDto,
  ): Promise<ResponseSuccess> {
    const userEntity = await this.authService.validateUser(userLoginDto);
    const permissions = await this.permissionService.findAllPermissionsByRoleId(
      userEntity.roleId,
    );
    const token = await this.authService.createToken(userEntity);
    const response = new LoginPayloadDto(
      userEntity.toDto(),
      token,
      permissions.map((permission) => permission.permissionName),
    );
    return new ResponseSuccess("translations.LOGIN_SUCCESS", response);
  }

  /**
   * User Registration
   */

  @Post("admin")
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: UserDto, description: "Successfully Registered" })
  @ApiBody({ type: adminRegisterSwagger })
  async admin(
    @Body("user") userRegisterDto: UserRegisterDto,
  ): Promise<ResponseSuccess> {
    const createdUser = await this.userCreateService.admin(userRegisterDto);
    return new ResponseSuccess(
      "translations.REGISTERED_SUCCESSFULLY",
      createdUser.toDto(),
    );
  }

  /**
   * User Registration with in Organization
   */

  @Post("register")
  @HttpCode(HttpStatus.CREATED)
  @ApiOkResponse({ type: UserDto, description: "Successfully Registered" })
  @ApiBody({ type: useregisterSwagger })
  async userRegister(
    @Req() request: Request,
    @Body("user") userRegisterDto: UserRegisterDto,
    @Body("organization") organizationName: string,
  ): Promise<ResponseSuccess> {
    const lang = request.headers["accept-language"];
    const createdUser = await this.userCreateService.createUser(
      userRegisterDto,
      organizationName,
      lang,
    );
    return new ResponseSuccess(
      "translations.REGISTERED_SUCCESSFULLY",
      createdUser.toDto(),
    );
  }

  /**
   * User Password reset
   */

  @Post("reset-password")
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    type: Boolean,
    description: "User reset password success",
  })
  @ApiBody({ type: userResetPasswordSwagger })
  async resetPassword(
    @Body("password") newPassword: string,
    @Body("token") token: string,
  ): Promise<ResponseSuccess> {
    const status = await this.userUpdateService.resetPassword(
      newPassword,
      token,
    );
    return new ResponseSuccess(`translations.PASSWORD_RESET_SUCCESSFUL`, {
      status,
    });
  }

  /**
   * send Password reset link
   */

  @Post("send-reset-link")
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    type: Object,
    description: "Password reset link sent",
  })
  async sendResetPasswordLink(
    @Req() request: Request,
    @Body(new ValidationPipe()) userForgotPasswordDto: UserForgotPasswordDto,
  ): Promise<ResponseSuccess> {
    const lang = request.headers["accept-language"];
    await this.authService.sendResetPasswordLink(userForgotPasswordDto, lang);
    return new ResponseSuccess(
      "translations.PASSWORD_RESET_LINK_SUCCESSFUL",
      {},
    );
  }

  /**
   * User deatil
   */

  @Get("me")
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  @UseInterceptors(AuthUserInterceptor)
  @ApiBearerAuth()
  @ApiOkResponse({
    type: MyProfilePayloadDto,
    description: "Current user info",
  })
  async getCurrentUser(@AuthUser() user: UserEntity): Promise<ResponseSuccess> {
    const newUser = await this.userReadService.findUserByEmail(user.email, [
      "role",
      "organization",
    ]);
    const permissions = await this.permissionService.findAllPermissionsByRoleId(
      user.roleId,
    );
    const response = new MyProfilePayloadDto(
      newUser.toDto(),
      permissions.map((permission) => permission.permissionName),
    );
    return new ResponseSuccess("translations.PROFILE", response);
  }

  /**
   * Verify user email
   */

  @Post("verify")
  @HttpCode(HttpStatus.CREATED)
  @ApiOkResponse({
    type: Boolean,
    description: "Verify user email",
  })
  @ApiBody({ type: tokenSwagger })
  async verifyUserEmail(
    @Body("token") token: string,
  ): Promise<ResponseSuccess> {
    const status = await this.userUpdateService.verifyUserEmail(token);
    return new ResponseSuccess(`translations.USER_VERIFY`, { status });
  }

  /**
   * Resend email verification link
   */
  @Post("resend-verification-link")
  @HttpCode(HttpStatus.CREATED)
  @ApiOkResponse({
    type: Boolean,
    description: "Resend email verification link",
  })
  async resendEmailVerificationLink(
    @Req() request: Request,
    @Body(new ValidationPipe()) userEmailVerifyDto: UserEmailVerifyDto,
  ): Promise<ResponseSuccess> {
    const lang = request.headers["accept-language"];
    await this.authService.resendEmailVerificationLink(
      userEmailVerifyDto,
      lang,
    );
    return new ResponseSuccess(`translations.VERIFY_LINK_SENT`, {});
  }
}
