import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { UserRole } from "@prisma/client";

export interface AuthedRequest extends Request {
  user?: { sub: string; role: UserRole; campId: string | null };
}

export function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Kein Token angegeben" });
  }
  try {
    const token = header.slice("Bearer ".length);
    req.user = jwt.verify(token, process.env.JWT_SECRET || "dev-secret") as AuthedRequest["user"];
    next();
  } catch {
    return res.status(401).json({ error: "Token ungültig oder abgelaufen" });
  }
}

export function requireRole(...roles: UserRole[]) {
  return (req: AuthedRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Keine Berechtigung" });
    }
    next();
  };
}
