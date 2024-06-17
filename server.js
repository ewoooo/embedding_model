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

// 테스트 페이지
app.get("/chat", function (req, res) {
	res.sendFile(__dirname + "/view/chat.html");
});

// 임베딩 생성 페이지
app.get("/create", function (req, res) {
	res.sendFile(__dirname + "/view/create.html");
});

// 유사도 확인 페이지
app.get("/examine", function (req, res) {
	res.sendFile(__dirname + "/view/examine.html");
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

// 임베딩 만들기 요청
app.post("/request", async (req, res) => {
	try {
		const title = req.body.title;
		const event = req.body.event;
		const prompt = req.body.prompt;
		let result = await axios.post(
			"https://api.openai.com/v1/embeddings",
			{
				input: title,
				model: "text-embedding-3-small",
			},
			{
				headers: {
					"Content-Type": "application/json",
					Authorization: "Bearer " + process.env.OPENAI_API_KEY,
				},
			}
		);

		// items 테이블에 결과값 삽입
		let command = "INSERT INTO items (title, embedding, event, prompt) VALUES($1, $2, $3, $4)";
		let value = [title, pgvector.toSql(result.data.data[0].embedding), event, prompt];
		await client.query(command, value);
		console.log("임베딩 타겟", title);

		// 데이터베이스에서 임베딩 열을 제외한 모든 항목 찾기
		const query = "SELECT title, event, prompt FROM items";
		const resultList = await client.query(query);

		// 조회한 데이터를 클라이언트로 전송
		res.send(resultList.rows);
	} catch (error) {
		console.error("Error Occurred");
	}
});

// 임베딩 비교 요청
app.post("/compare", async (req, res) => {
	const target = req.body.title;
	const targetEvent = req.body.event;
	let result = await axios.post(
		"https://api.openai.com/v1/embeddings",
		{
			input: target,
			model: "text-embedding-3-small",
		},
		{
			headers: {
				"Content-Type": "application/json",
				Authorization: "Bearer " + process.env.OPENAI_API_KEY,
			},
		}
	);
	let command = `SELECT id, title, 1 - (embedding <=> $1) as similarity FROM items WHERE event = $2`;
	let value = [pgvector.toSql(result.data.data[0].embedding), targetEvent];
	let rankList = await client.query(command, value);
	res.send(rankList.rows);
});

//임베딩 불러오기
app.get("/table", async (req, res) => {
	const loadTable = `SELECT title, event, prompt FROM items`;
	const result = await client.query(loadTable);
	res.send(result.rows);
});
