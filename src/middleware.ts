// import { NextFunction, Request, Response } from "express";
// import { JWT_SECRET } from "./config";
// import jwt, { JwtPayload } from "jsonwebtoken";
// export const userMiddleware = async (
// 	req: Request,
// 	res: Response,
// 	next: NextFunction
// ) => {
// 	const header = req.headers["authorization"];

// 	if (!header || !header.startsWith("Bearer")) {
// 		return res.status(401).json({ message: "Unauthorized User" });
// 	}
// 	try {
// 		const token = header.split(" ")[1];
// 		const decoded = jwt.verify(token, JWT_SECRET);

// 		if (typeof decoded === "object" && "id" in decoded) {
// 			req.userId = (decoded as JwtPayload).id;
// 			next();
// 		} else {
// 			res.status(401).json({ message: "Invallid Token" });
// 		}
// 	} catch (error) {
// 		res.status(401).json({ message: "Unauthorized User" });
// 	}
// };

import { NextFunction, Request, Response } from "express";
import { JWT_SECRET } from "./config";
import jwt from "jsonwebtoken";
export const userMiddleware = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	const header = req.headers["authoriation"];

	const decoded = jwt.verify(header as string, JWT_SECRET);

	if (decoded) {
		// @ts-ignore
		req.userId = decoded.id;
		next();
	} else {
		res.status(401).json({ message: "Unauthorized User" });
	}
};
