import express from "express";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname } from "path";
import OpenAI from "openai";

// 환경 변수 설정
dotenv.config();
const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// OpenAI 초기화
const openai = new OpenAI(process.env.OPENAI_API_KEY);

// 미들웨어 설정
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));
app.use(express.static(__dirname + "/view"));

// 서버 시작
app.listen(8082, function () {
	console.log("System Run");
	console.log("http://localhost:8082");
});

// 라우팅 설정
app.get("/", function (req, res) {
	res.sendFile(__dirname + "/view/index.html");
});

app.get("/result", function (req, res) {
	res.sendFile(__dirname + "/view/result.html");
});

// OpenAI API 엔드포인트
app.post("/gpt", async (req, res) => {
	try {
		const messages = req.body;
		console.log("전달 데이터", messages[messages.length - 1]);
		const response = await openai.chat.completions.create({
			model: "gpt-4o",
			messages: messages,
			temperature: 1,
			max_tokens: 64,
			top_p: 1,
			frequency_penalty: 0.7,
		});
		console.log("받은 데이터", response.choices[0].message);
		res.json(response);
	} catch (error) {
		console.error("Error calling OpenAI API:", error);
		res.status(500).send("Error occurred while processing your request.");
	}
});

// OpenAI Embedding API 엔드포인트
async function getEmbedding(myInput) {
	const embedding = await openai.embeddings.create({
		model: "text-embedding-3-small",
		input: myInput,
		encoding_format: "float",
	});

	console.log("임베딩이 완료되었습니다:", embedding);
	console.log("임베딩이 완료되었습니다:", embedding.data[0].embedding);
}
