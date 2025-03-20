import express from "express";
import { random } from "./utils";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "./config";
import { ContentModel, LinkModel, UserModel } from "./db";
import { userMiddleware } from "./middleware";
import cors from "cors";

const app = express();
app.use(express.json());
app.use(cors());

//Route 1: User Signup
app.post("/api/v1/signup", async (req, res) => {
	const username = req.body.username;
	const password = req.body.password;
	try {
		await UserModel.create({ username, password });
		res.json({ message: "User signed Up" });
	} catch (e) {
		res.status(409).json({ message: "User already Exists3" });
	}
});

//Route 2: User Signin
app.post("/api/v1/signin", async (req, res) => {
	const username = req.body.username;
	const password = req.body.password;
	const existingUser = await UserModel.findOne({
		username,
		password,
	});
	if (existingUser) {
		const token = jwt.sign({ id: existingUser._id }, JWT_SECRET);
		res.json({ token });
	} else {
		res.status(409).json({ message: "Invalid credentials" });
	}
});

//Route 3: Add Content
app.post("/api/v1/content", userMiddleware, async (req, res) => {
	const { link, type, title } = req.body;
	await ContentModel.create({
		link,
		type,
		title,
		userId: req.userId,
		tags: [],
	});
	res.json({ message: "Content Added" });
});

//Route 4: Get User Content
app.get("/api/v1/content", userMiddleware, async (req, res) => {
	const userId = req.userId;
	const content = await ContentModel.find({ userId: userId }).populate(
		"userId",
		"username"
	);
	res.json(content);
});
//Route 5: Delete User Content
app.delete("/api/v1/content", userMiddleware, async (req, res) => {
	const contentId = req.body.contentId;
	await ContentModel.deleteMany({ contentId, userId: req.userId });
	res.json({ message: "Deleted" });
});
//Route 6: Share Content Link
app.post("/api/v1/brain/share", userMiddleware, async (req, res) => {
	const { share } = req.body;
	if (share) {
		const existingLink = await LinkModel.findOne({ userId: req.userId });
		if (existingLink) {
			res.json({ hash: existingLink.hash });
			return;
		}
		const hash = random(10);
		await LinkModel.create({ userId: req.userId, hash });
		res.json({ hash });
	} else {
		await LinkModel.create({ userId: req.userId });
		res.json({ message: "removed Link" });
	}
});
//Route 7: Get Shared Content
app.get("/api/v1/brain/:shareLink", async (req, res) => {
	const hash = req.params.shareLink;
	const link = await LinkModel.findOne({ hash });
	if (!link) {
		res.status(404).json({ message: "invalid share link" });
		return;
	} // ehello
	const content = await ContentModel.find({ userId: link.userId });
	const user = await UserModel.findOne({ _id: link.userId });
	if (!user) {
		res.status(404).json({ message: "user not found" });
		return;
	}
	res.json({
		username: user.username,
		content,
	});
});

//start the server
app.listen(3000);
