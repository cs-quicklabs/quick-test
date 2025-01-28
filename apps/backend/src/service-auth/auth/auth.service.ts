import {
  Injectable,
  ForbiddenException,
  BadRequestException,
  NotFoundException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";

import { ExpectationFailedException } from "../../exceptions/expectation-failed.exception";
import { ContactFormDto } from "../../shared/contact-form/dto/contactFormDto";
import { EmailService } from "../../service-emails/email/email.service";
import { ContextService } from "../../_helpers/context.service";
import { UtilsService } from "../../_helpers/utils.service";
import { UserDto } from "../../service-users/user/dto/UserDto";
import { UserEntity } from "../../service-users/user/user.entity";
import { TokenPayloadDto } from "./dto/TokenPayloadDto";
import { UserLoginDto } from "./dto/UserLoginDto";
import { UserEmailVerifyDto } from "./dto/UserEmailVerifyDto";
import { RoleType } from "../../common/enums/role-type";
import { UserForgotPasswordDto } from "./dto/UserForgotPasswordDto";
import { UserCreateService } from "../../service-users/user/services/create.service";
import { UserReadService } from "../../service-users/user/services/read.service";
import { PaymentService } from "../../service-organization/payment/payment.service";
import { ConfigService } from "@nestjs/config";
import { AllConfigType } from "../../config/config.type";

@Injectable()
export class AuthService {
  private static _authUserKey = "user_key";
  private webUrl: string;
  constructor(
    public readonly jwtService: JwtService,
    public readonly configService: ConfigService<AllConfigType>,
    public readonly userReadService: UserReadService,
    public readonly userCreateService: UserCreateService,
    private readonly paymentService: PaymentService,
    public readonly mailService: EmailService,
  ) {
    this.webUrl = this.configService.get("app.webUrl", { infer: true });
  }

  /**
   * Internal method for Token creation
   */

  async createToken(user: UserEntity | UserDto): Promise<TokenPayloadDto> {
    return new TokenPayloadDto({
      expiresIn: this.configService.get("app.jwtExpirationTime", {
        infer: true,
      }),
      accessToken: await this.jwtService.signAsync({ id: user.id }),
    });
  }

  /**
   * Internal method to Validate User
   */
  async validateUser(userLoginDto: UserLoginDto): Promise<UserEntity> {
    const user = await this.userReadService.findUserByEmail(
      userLoginDto.email,
      ["role", "organization"],
    );
    const isPasswordValid = await UtilsService.validateHash(
      userLoginDto.password,
      user && user.password,
    );
    if (!user || !isPasswordValid) {
      throw new ExpectationFailedException(
        "translations.INCORRECT_CREDENTIALS",
      );
    }
    if (user.role.roleType === RoleType.ORGADMIN && !user.isVerified) {
      throw new BadRequestException("translations.VERIFY_EMAIL");
    }
    return user;
  }

  /**
   * Internal method to Set Auth User
   */

  static setAuthUser(user: UserEntity): void {
    ContextService.set(AuthService._authUserKey, user);
  }

  /**
   * Internal method to Get Auth User
   */

  static getAuthUser(): UserEntity {
    return ContextService.get(AuthService._authUserKey);
  }

  /**
   * Method to send welcome mail after registration
   * @param user
   * @returns boolean
   */
  async sendWelcomeNewUserEmail(
    user: UserEntity,
    lang: string,
  ): Promise<boolean> {
    if (!user) throw new NotFoundException("translations.RECORD_NOT_FOUND");
    const emailVerifyToken =
      await this.userCreateService.createEmailVerificationToken(user.email);
    const verifyLink = `${this.webUrl}verify?token=${emailVerifyToken.token}`;
    this.mailService.sendWelcomeNewUserEmail(user, verifyLink, lang);
    return true;
  }

  /**
   * Method to send welcome and reset password email
   * to newly added member
   * @param member
   * @param requestedBy
   * @returns boolean
   */
  async sendWelcomeMemberEmail(
    member: UserEntity,
    requestedBy: UserEntity,
    lang: string,
  ): Promise<boolean> {
    if (!member) throw new NotFoundException("translations.RECORD_NOT_FOUND");
    const tokenModel = await this.userCreateService.createVerificationToken(
      member.email,
    );
    const resetLink = `${this.webUrl}reset-password?token=${tokenModel.token}`;
    this.mailService.sendWelcomeMemberEmail(
      member,
      requestedBy,
      resetLink,
      lang,
    );
    return true;
  }

  /**
   * Method to send acknowledgement email
   * after receiving contact form
   * @param data
   * @returns boolean
   */
  async sendContactFormAcknowledgementEmail(
    data: ContactFormDto,
    lang: string,
  ): Promise<boolean> {
    const name = data.lastName
      ? data?.firstName.concat(" ", data.lastName)
      : data?.firstName;
    this.mailService.sendContactFormAcknowledgementEmail(
      data?.email,
      name,
      lang,
    );
    return true;
  }

  /**
   * Method to free trial start email to user
   * @param data
   * @returns boolean
   */
  async sendFreeTrialStartMail(
    user: UserEntity,
    lang: string,
  ): Promise<boolean> {
    if (!user?.email) return false;
    const price = this.paymentService.findprices();
    const amount = (await price).unit_amount;
    const { interval } = (await price).recurring;
    this.mailService.sendFreeTrialStartMail(user, amount, interval, lang);
    return true;
  }

  /**
   * Method to send email for freeTrial
   * expiring in upcomming two days
   * @param data
   * @returns boolean
   */
  async sendUserFreeTrialExpiringMail(user: UserEntity): Promise<boolean> {
    if (!user?.email) return false;
    this.mailService.sendUserFreeTrialExpiringMail(user);
    return true;
  }

  /**
   * Method to send email for freeTrial
   * expired
   * @param data
   * @returns boolean
   */
  async sendUserFreeTrialExpiredMail(user: UserEntity): Promise<boolean> {
    if (!user?.email) return false;
    this.mailService.sendUserFreeTrialExpiredMail(user);
    return true;
  }

  /**
   * Method to send reset password link
   * @param userForgotPasswordDto
   * @returns boolean
   */
  async sendResetPasswordLink(
    userForgotPasswordDto: UserForgotPasswordDto,
    lang: string,
  ): Promise<boolean> {
    const user = await this.userReadService.findOne({
      email: userForgotPasswordDto.email,
    });
    if (!user) throw new NotFoundException("translations.RECORD_NOT_FOUND");
    const tokenModel = await this.userCreateService.createVerificationToken(
      user.email,
    );
    const resetLink = `${this.webUrl}reset-password?token=${tokenModel.token}`;
    this.mailService.sendResetPasswordLink(user, resetLink, lang);
    return true;
  }

  /**
   * Internal method to send email verification link
   */
  async resendEmailVerificationLink(
    userEmailVerifyDto: UserEmailVerifyDto,
    lang: string,
  ): Promise<boolean> {
    const user = await this.userReadService.findOne({
      email: userEmailVerifyDto.email,
    });
    if (!user) throw new NotFoundException("translations.RECORD_NOT_FOUND");
    if (user.isVerified)
      throw new ForbiddenException("translations.ALREADY_VERIFIED");
    const emailVerifyToken =
      await this.userCreateService.createEmailVerificationToken(user.email);
    const verifyLink = `${this.webUrl}verify?token=${emailVerifyToken.token}`;
    this.mailService.resendEmailVerificationLink(user, verifyLink, lang);
    return true;
  }
}
