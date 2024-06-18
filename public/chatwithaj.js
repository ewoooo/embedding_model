const messageContainer = document.querySelector(".content-wrapper");
const submit = document.querySelector("#req-button");
const message = document.querySelector("#req-message");

let log = [
	{ role: "system", content: "짧게 두 문장 이내로 답변하겠습니다." },
	{ role: "assistant", content: "좋아하는 강아지가 있으신가요?" },
];

// 메시지 생성
function createMessage(messenger, query) {
	const messageDiv = document.createElement("div");
	const content = document.createElement("p");
	content.textContent = query;
	messageDiv.classList.add("message", messenger === "user" ? "req" : "res");
	messageDiv.appendChild(content);
	return messageDiv;
}

// 메시지 렌더링
let messageShowCount = 0;

function renderMessages() {
	messageContainer.innerHTML = "";
	for (let i = 1; i < log.length; i++) {
		messageContainer.appendChild(createMessage(log[i].role, log[i].content));
	}
}

// GPT 대화 FETCH
async function requestResponse() {
	const userMessage = message.value.trim();
	if (userMessage) {
		log.push({ role: "user", content: userMessage });
		console.table(log);
		renderMessages();

		try {
			const response = await fetch("/gpt", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(log),
			});
			const data = await response.json();
			const responseMessage = data.choices[0].message.content;
			log.push({ role: "assistant", content: responseMessage });
			renderMessages();
		} catch (error) {
			console.error("Error:", error);
			renderMessages();
		}
		message.value = "";
		console.log("Sequence Ended");
	}
}

// GPT 임베딩 FETCH
async function requestEmbedding() {
	const userMessage = message.value.trim();
	if (userMessage) {
		let target = log.content;
		console.table(target);
		renderMessages();

		try {
			const response = await fetch("/query", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(target),
			});
			const data = await response.json();
			const responseMessage = data;
			renderMessages();
		} catch (error) {
			console.error("Error:", error);
			renderMessages();
		}
		message.value = "";
		console.log("Sequence Ended");
	}
}

// 전송 이벤트
submit.addEventListener("click", requestEmbedding);
message.addEventListener("keypress", function (e) {
	if (e.key === "Enter") {
		e.preventDefault();
		requestResponse();
	}
});

// 초기 메시지 렌더링
renderMessages();
