import roleAuthorization from '../checkRole.js';
import { ErrorHandler } from '../error.js';

describe('Role Authorization Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      user: { role: 'CUSTOMER' },
    };
    res = {};
    next = jest.fn();
  });

  it('should call next if user has an allowed role', async () => {
    const allowedRoles = ['CUSTOMER', 'ADMIN'];
    const middleware = roleAuthorization(allowedRoles);

    await middleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(next).not.toHaveBeenCalledWith(expect.any(ErrorHandler));
  });

  it('should return 401 if user is not authenticated', async () => {
    req.user = undefined;
    const allowedRoles = ['CUSTOMER', 'ADMIN'];
    const middleware = roleAuthorization(allowedRoles);

    await middleware(req, res, next);

    expect(next).toHaveBeenCalledWith(
      new ErrorHandler(401, 'unauthorized, session finished, please re-login'),
    );
  });

  it('should return 403 if user role is not in allowed roles', async () => {
    req.user.role = 'GUEST';
    const allowedRoles = ['ADMIN', 'MODERATOR'];
    const middleware = roleAuthorization(allowedRoles);

    await middleware(req, res, next);

    expect(next).toHaveBeenCalledWith(
      new ErrorHandler(403, 'the role you have does not have permission'),
    );
  });
});
