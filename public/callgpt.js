import OpenAI from "openai";
import dotenv from "dotenv";
import { json, query } from "express";

dotenv.config();

const openai = new OpenAI();

export async function callGPT(query) {
	const response = await openai.chat.completions.create({
		model: "gpt-3.5-turbo",
		messages: query,
		temperature: 1,
		max_tokens: 1024,
		top_p: 1,
		frequency_penalty: 0.7,
	});
}
