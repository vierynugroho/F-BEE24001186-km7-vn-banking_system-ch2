import * as OTPAuth from 'otpauth';

const totp = new OTPAuth.TOTP({
  issuer: 'ACME',
  label: 'AzureDiamond',
  algorithm: 'SHA1',
  digits: 6,
  period: 180, // by second
  secret: 'NB2W45DFOIZA',
});

export class OTP {
  static async generateOTP() {
    return totp.generate();
  }

  static async validate(OTPToken) {
    return totp.validate({
      token: OTPToken,
      window: 1,
    });
  }
}
