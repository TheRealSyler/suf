export namespace Password {
  /**
   * Defines the properties of a Password.Validate Check
   */
  export interface ValidateCheck {
    /**
     * Type of the check
     */
    type: 'custom' | 'numbers' | 'letters' | 'lowercase' | 'uppercase' | 'spaces' | 'symbols' | 'customRegex';
    /**
     * if the type is one of  **`'numbers' | 'letters' | 'lowercase' | 'uppercase' | 'spaces' | 'symbols'`** then this
     * property defines the times that the type can occur without failing the check, if negative is true then
     * this property defines how many time this type is allowed.
     */
    times?: number;
    /**
     * if true then the result of **`'numbers' | 'letters' | 'lowercase' | 'uppercase' | 'spaces' | 'symbols' | 'customRegex'`**
     * will be inverted, example if the type is  **`customRegex`** and customRegex =  **`/123/g`** then the password cannot contain  **`123`**.
     */
    negative?: boolean;
    /**
     * if the type is **`custom`** then this function will be executed.
     */
    customFunc?: (password: string) => boolean;
    /**
     * if the type is **`customRegex`** then this regex will be tested.
     */
    customRegex?: RegExp;
    /**
     * if the type is **`custom | customRegex`** then this will be the error the if the check fail's.
     */
    customError?: string;
  }
  /**
   * the Options for the Password.Validate function.
   */
  export interface ValidateOptions {
    /**
     * the maximum length of the password, if the password is longer then the other checks will not be performed.
     */
    maxLength?: number;
    /**
     * the minimum length of the password, if the password is shorter then the other checks will not be performed.
     */
    minLength?: number;
    /**
     * if true additional data will be returned.
     */
    passData?: boolean;
  }
  export interface ValidateReturn {
    /**
     * array that contains the error messages of all the failed checks.
     */
    errors: string[];
    /**
     * true if all the checks have passed successfully.
     */
    passed: boolean;
    /**
     * array with the additional data about each test.
     */
    validationData?: { negative: boolean; errType: string }[];
  }
  /**
   * Validates a password or other strings with checks that have to be provided in the checks array,
   * if the **`passed`** key of the returned object is true
   * then all checks have been passed successfully.
   *
   * @param password password or other string to be checked.
   * @param checks array of checks that will be performed.
   * @param options min and max length and other stuff.
   */
  export function Validate(
    password: string,
    checks: ValidateCheck[],
    options: ValidateOptions = { maxLength: 100, minLength: 0, passData: false }
  ): ValidateReturn {
    const errors: string[] = [];
    const data = [];
    let passed = true;
    for (let i = 0; i < checks.length; i++) {
      if (password.length > options.maxLength || password.length < options.minLength) {
        errors.push(`Password is to ${password.length > options.maxLength ? 'long' : 'short'}`);
        passed = false;
        break;
      }
      const check = _validateCheck(checks[i], password);
      data.push(check.data);
      if (check.err) {
        errors.push(check.err);
      }
      if (check.passed === false) {
        passed = false;
      }
    }
    if (options.passData) {
      return { passed, errors, validationData: data };
    } else {
      return { passed, errors };
    }
  }
  /**
   * The password has to contain an uppercase letter, number and cannot contain any spaces.
   * @param password password or string to check.
   */
  export function ValidateSimple(password: string) {
    return Password.Validate(password, [{ type: 'uppercase' }, { type: 'numbers' }, { type: 'spaces', negative: true }]).passed;
  }
  interface _ValidateHandledRegex {
    errType: 'normal' | 'times';
    passed: boolean;
  }
  function _validateCheck(check: ValidateCheck, password: string): { err: string; passed: boolean; data: {} } {
    let err = undefined;
    let passed = true;
    let handled: _ValidateHandledRegex;
    let data: { negative: boolean; errType: string } = { negative: check.negative, errType: undefined };
    switch (check.type) {
      case 'custom':
        if (check.customFunc) {
          passed = check.customFunc(password);
          err = passed ? undefined : check.customError;
        } else {
          err = 'customFunc has to be defined';
        }

        data.errType = 'custom';
        break;
      case 'customRegex':
        if (check.customRegex) {
          passed = check.customRegex.test(password);
          if (check.negative) {
            passed = !passed;
          }
          err = passed ? undefined : check.customError;
        } else {
          err = 'customRegex has to be defined';
        }

        data.errType = 'customRegex';
        break;
      case 'numbers':
        handled = _validateHandleRegex(password.match(/\d/g), check.negative, check.times);
        data.errType = handled.errType;
        passed = handled.passed;
        if (check.customError && passed !== true) {
          err = check.customError;
        } else if (!passed) {
          err = _validateHandleErr(
            handled,
            check.negative,
            'password has to contain at least one number',
            'password cannot contain numbers',
            `password has to contain ${check.times} or more numbers`,
            `password cannot contain more than ${check.times} numbers`
          );
        }

        break;
      case 'letters':
        handled = _validateHandleRegex(password.match(/[a-z][A-Z]/g), check.negative, check.times);
        data.errType = handled.errType;
        passed = handled.passed;
        if (check.customError && passed !== true) {
          err = check.customError;
        } else if (!passed) {
          err = _validateHandleErr(
            handled,
            check.negative,
            'password has to contain at least one letter',
            'password cannot contain letters',
            `password has to contain ${check.times} or more letters`,
            `password cannot contain more than ${check.times} letters`
          );
        }
        break;
      case 'lowercase':
        handled = _validateHandleRegex(password.match(/[a-z]/g), check.negative, check.times);
        data.errType = handled.errType;
        passed = handled.passed;
        if (check.customError && passed !== true) {
          err = check.customError;
        } else if (!passed) {
          err = _validateHandleErr(
            handled,
            check.negative,
            'password has to contain at least one lowercase letter',
            'password cannot contain lowercase letters',
            `password has to contain ${check.times} or more lowercase letters`,
            `password cannot contain more than ${check.times} lowercase letters`
          );
        }

        break;
      case 'uppercase':
        handled = _validateHandleRegex(password.match(/[A-Z]/g), check.negative, check.times);
        data.errType = handled.errType;
        passed = handled.passed;
        if (check.customError && passed !== true) {
          err = check.customError;
        } else if (!passed) {
          err = _validateHandleErr(
            handled,
            check.negative,
            'password has to contain at least one uppercase letter',
            'password cannot contain uppercase letters',
            `password has to contain ${check.times} or more uppercase letters`,
            `password cannot contain more than ${check.times} uppercase letters`
          );
        }

        break;
      case 'spaces':
        handled = _validateHandleRegex(password.match(/\s/g), check.negative, check.times);
        data.errType = handled.errType;
        passed = handled.passed;
        if (check.customError && passed !== true) {
          err = check.customError;
        } else if (!passed) {
          err = _validateHandleErr(
            handled,
            check.negative,
            'password has to contain at least one space',
            'password cannot contain spaces',
            `password has to contain ${check.times} or more spaces`,
            `password cannot contain more than ${check.times} spaces`
          );
        }

        break;
      case 'symbols':
        handled = _validateHandleRegex(
          password.match(/[`~\!@#\$%\^\&\*\(\)\-_\=\+\[\{\}\]\\\|;:'",<.>\/\?€£¥₹]/g),
          check.negative,
          check.times
        );
        data.errType = handled.errType;
        passed = handled.passed;
        if (check.customError && passed !== true) {
          err = check.customError;
        } else if (!passed) {
          err = _validateHandleErr(
            handled,
            check.negative,
            'password has to contain at least one symbol',
            'password cannot contain symbols',
            `password has to contain ${check.times} or more symbols`,
            `password cannot contain more than ${check.times} symbols`
          );
        }
        break;
      default:
        err = 'checking type not valid';
        break;
    }
    return { err, passed, data };
  }
  function _validateHandleRegex(match: RegExpMatchArray, negative: boolean, times: number): _ValidateHandledRegex {
    if (match === null) {
      return { errType: times ? 'times' : 'normal', passed: negative ? true : false };
    }
    if (times) {
      return { errType: 'times', passed: negative ? match.length <= times : match.length >= times };
    }
    return { errType: 'normal', passed: negative ? match.length < 1 : match.length > 0 };
  }
  function _validateHandleErr(
    handled: _ValidateHandledRegex,
    negative: boolean,
    errPos: string,
    errNeg: string,
    errTimesPos: string,
    errTimesNeg: string
  ): string | undefined {
    if (!handled.passed) {
      if (handled.errType === 'normal') {
        return negative ? errNeg : errPos;
      } else {
        return negative ? errTimesNeg : errTimesPos;
      }
    }
    return undefined;
  }
}
