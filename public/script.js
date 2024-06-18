const messageContainer = document.querySelector(".content-wrapper");
const submit = document.querySelector("#req-button");
const message = document.querySelector("#req-message");

// 배열
let eventCount = 1;
let messageCount = 1;
let promptPipeline = [];
let chatLog = [{ role: "assistant", content: "키우는 강아지가 있으신가요?" }];

const event1 = [
	{ role: "assistant", content: "정말 귀엽겠네요!" },
	{ role: "assistant", content: "어떻게 생겼나요?" },
	{ role: "assistant", content: "말씀해주세요!" },
];

// 유저가 메세지 전송하면 채팅 로그에 보내는 기능
function userInput() {
	const answer = message.value.trim();
	const object = { role: "user", content: answer, encounter: "requestEmbedding", event: `event${eventCount}` };
	chatLog.push(object);
	eventCount++;
	console.log("이벤트 카운트+1 / 현재: " + eventCount);
	console.log(object);
	return object;
}

// 서버에 임베딩 요청하는 기능
async function requestEmbedding(object) {
	if (object.encounter == "requestEmbedding") {
		console.log("유저의 임베딩 비교 요청: " + object.content);
		const requestPayload = { title: object.content, event: object.event };
		try {
			const response = await fetch("/compare", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(requestPayload),
			});
			const data = await response.json(); // 서버 데이터 수신
			console.log("유저의 임베딩 비교 요청: 성공"); // 로그에 입력
			return data;
		} catch (error) {
			console.error("!! 유저의 임베딩 비교 요청: 서버 연결 실패");
		}
	}
}

// 배열에서 가장 유사한 임베딩 찾는 기능
function collectEmbedding(array) {
	console.log("임베딩 정렬: 시작");
	array.sort((a, b) => b.similarity - a.similarity);
	const result = array.slice(0, 1);
	const data = { title: result[0].title, prompt: result[0].prompt };
	console.log("임베딩 정렬: 종료");
	return data;
}

// 애니메이션 추가
function addAnimation(target) {
	target.style.animation = `dropIn 1000ms cubic-bezier(0.33, 1, 0.68, 1) forwards`;
	target.style.opacity = 1;

	setTimeout(() => {
		target.style = "";
	}, 1000);
}

// 배열 밸런싱 기능
function balanceMessages(embeddingData, script) {
	console.log("배열 밸런싱: 시작");
	promptPipeline.push(embeddingData);

	// 메시지를 일정 시간 간격으로 추가
	setTimeout(() => {
		script.forEach((message, index) => {
			setTimeout(() => {
				chatLog.push(message);
				renderMessages(chatLog); // 메시지 추가 후 렌더링
			}, index * 1000); // 2초 간격으로 메시지 추가
		});
	}, 2000);

	console.log("배열 밸런싱: 프롬프트 파이프라인, 채팅 로그");
	console.log(promptPipeline);
	console.log(chatLog);
}

// 메시지 생성 기능
function createMessage(messenger, message) {
	const container = document.createElement("div");
	const content = document.createElement("p");

	container.classList.add("message", messenger === "user" ? "req" : "res");
	content.textContent = message;

	container.appendChild(content);

	return container;
}

// 모니터 렌더링
function renderMonitor() {
	const container = document.querySelector(".monitor-prompt");
	const content = document.createElement("p");
	console.log(promptPipeline);
	container.innerHTML = " ";
	content.textContent = promptPipeline[0].prompt;

	container.append(content);
}

// 메시지 렌더링 기능
function renderMessages(array) {
	messageContainer.innerHTML = ""; // 컨테이너 초기화

	for (let i = 0; i < array.length; i++) {
		const message = createMessage(array[i].role, array[i].content);
		messageContainer.appendChild(message); // 메세지 렌더링
	}

	const lastMessage = document.querySelector(`.message:nth-last-child(1)`);
	if (lastMessage) {
		addAnimation(lastMessage);
	}
}

async function eventBundle() {
	const answer = userInput();
	try {
		const embeddingData = await requestEmbedding(answer);
		const similarestData = await collectEmbedding(embeddingData);
		balanceMessages(similarestData, event1);
		renderMonitor();
		renderMessages(chatLog);
	} catch (error) {
		console.error("메시지 전송 실패: ", error);
	}
}

// 전송 이벤트
submit.addEventListener("click", function () {
	eventBundle();
	message.value = "";
});
message.addEventListener("keypress", async function (e) {
	if (e.key === "Enter") {
		await eventBundle();
		message.value = "";
	}
});

// 초기 메시지 렌더링
renderMessages(chatLog);
