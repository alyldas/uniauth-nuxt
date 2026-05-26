export interface UniAuthUser {
  readonly id: string;
  readonly displayName?: string;
  readonly email?: string;
  readonly phone?: string;
  readonly createdAt?: string;
  readonly updatedAt?: string;
  readonly disabledAt?: string;
  readonly metadata?: Record<string, unknown>;
}

export type UniAuthJsonUser = UniAuthUser;

export interface UniAuthSession {
  readonly id: string;
  readonly userId: string;
  readonly status?: string;
  readonly createdAt?: string;
  readonly expiresAt?: string;
  readonly revokedAt?: string;
  readonly lastSeenAt?: string;
  readonly metadata?: Record<string, unknown>;
}

export type UniAuthJsonSession = UniAuthSession;

export interface UniAuthSessionContext<
  User extends UniAuthJsonUser = UniAuthUser,
  Session extends UniAuthJsonSession = UniAuthSession,
> {
  readonly user: User;
  readonly session: Session;
}

export interface UniAuthPublicAuthResult<
  User extends UniAuthJsonUser = UniAuthUser,
  Session extends UniAuthJsonSession = UniAuthSession,
> extends UniAuthSessionContext<User, Session> {
  readonly identity?: Record<string, unknown>;
  readonly isNewUser?: boolean;
  readonly isNewIdentity?: boolean;
}

export interface UniAuthPasswordSignInBody {
  readonly email: string;
  readonly password: string;
  readonly metadata?: Record<string, unknown>;
}

export interface UniAuthModuleEndpointOptions {
  readonly session?: string;
  readonly passwordSignIn?: string;
  readonly logout?: string;
  readonly refresh?: string;
}

export interface UniAuthModuleRedirectOptions {
  readonly signIn?: string;
}

export interface UniAuthModuleOptions {
  readonly apiBase?: string;
  readonly apiPrefix?: string;
  readonly proxyPrefix?: string;
  readonly endpoints?: UniAuthModuleEndpointOptions;
  readonly redirects?: UniAuthModuleRedirectOptions;
  readonly forwardHeaders?: readonly string[];
  readonly sessionCookieNames?: readonly string[];
}

export interface ResolvedUniAuthModuleOptions {
  readonly apiBase: string;
  readonly apiPrefix: string;
  readonly proxyPrefix: string;
  readonly endpoints: Required<UniAuthModuleEndpointOptions>;
  readonly redirects: Required<UniAuthModuleRedirectOptions>;
  readonly forwardHeaders: readonly string[];
  readonly sessionCookieNames: readonly string[];
}

export interface UniAuthClientState<
  User extends UniAuthJsonUser = UniAuthUser,
  Session extends UniAuthJsonSession = UniAuthSession,
> {
  readonly user: User | null;
  readonly session: Session | null;
  readonly authenticated: boolean;
}
