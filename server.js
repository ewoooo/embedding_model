import express from "express";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname } from "path";
import OpenAI from "openai";
import axios from "axios";
import pg from "pg";
import pgvector from "pgvector";

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
const client = new pg.Pool({
	host: process.env.DB_HOST,
	user: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
	database: process.env.DB_NAME,
	port: process.env.DB_PORT,
	max: 5,
});

client.connect((err) => {
	if (err) {
		console.log("DB 연결 실패" + err);
	} else {
		app.listen(8082, function () {
			console.log("DB 연결 성공" + "http://localhost:8082");
		});
	}
});

// 라우팅

// 메인 페이지
app.get("/", function (req, res) {
	res.sendFile(__dirname + "/view/index.html");
});

// 임베딩 테스트
app.get("/result", function (req, res) {
	res.sendFile(__dirname + "/view/result.html");
});

// GPT CHAT 응답 핸들러
app.post("/gpt", async (req, res) => {
	try {
		const messages = req.body; // 클라이언트로부터 전달받은 메시지 로그
		console.log("전달 데이터", messages[messages.length - 1]); // 마지막 메시지를 로그로 출력 (디버깅용)

		// OpenAI API 호출하여 응답 생성
		const response = await openai.chat.completions.create({
			model: "gpt-4", // 사용할 모델
			messages: messages, // 클라이언트로부터 전달받은 메시지 로그
			temperature: 1,
			max_tokens: 64,
			top_p: 1,
			frequency_penalty: 0.7,
		});

		console.log("받은 데이터", response.choices[0].message); // OpenAI API 응답을 로그로 출력 (디버깅용)
		res.json(response); // 클라이언트에게 응답 반환
	} catch (error) {
		console.error("Error calling OpenAI API:", error); // 오류가 발생하면 콘솔에 출력
		res.status(500).send("Error occurred while processing your request."); // 클라이언트에게 오류 메시지 반환
	}
});

// Endpoint
app.post("/query", async (req, res) => {
	const message = req.body.detail; // 클라이언트 쿼리
	console.log("서버 전달 데이터", message); // 서버 전달 확인 디버깅 로그

	const result = await openai.embeddings.create({
		model: "text-embedding-3-small",
		input: message,
		encoding_format: "float",
	});

	let respond = { object: message, embedding: result.data[0].embedding };
	await console.log("임베딩이 완료되었습니다:", respond.object); // 수신 확인 디버깅 로그
	res.json(result.object);
});

// 임베딩 테스트
app.get("/add", async (req, res) => {
	const userInput = "테스트 2";
	let result = await axios.post(
		"https://api.openai.com/v1/embeddings",
		{
			input: userInput,
			model: "text-embedding-3-small",
		},
		{
			headers: {
				"Content-Type": "application/json",
				Authorization: "Bearer " + process.env.OPENAI_API_KEY,
			},
		}
	);
	let force = "INSERT INTO items (title, embedding) VALUES($1, $2)";
	let value = [userInput, pgvector.toSql(result.data.data[0].embedding)];
	await client.query(force, value);
	console.log(result.data.data[0].embedding);
	res.send("test");
});
