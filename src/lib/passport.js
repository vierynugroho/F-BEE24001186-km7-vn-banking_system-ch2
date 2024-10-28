import passport from 'passport';
import { prisma } from './prisma';
import { Strategy } from 'passport-local';

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  done(
    null,
    await prisma.users.findUnique({
      where: {
        id,
      },
    }),
  );
});

passport.use(
  Strategy({
    usernameField: 'email',
    passwordField: 'password',
  }),
);

export default passport;
