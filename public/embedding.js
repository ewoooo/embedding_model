const messageContainer = document.querySelector(".content-wrapper");
const submit = document.querySelector("#req-button");
const message = document.querySelector("#req-message");

let log = [{ role: "assistant", content: "좋아하는 강아지가 있으신가요?" }];

// 메세지 제작 기능
function createMessage(messenger, query) {
	const messageDiv = document.createElement("div");
	const content = document.createElement("p");
	content.textContent = query; // 메세지 안에 내용 담기
	messageDiv.classList.add("message", messenger === "user" ? "req" : "res");
	messageDiv.appendChild(content);
	return messageDiv;
}

// 메세지 화면 출력 기능
function renderMessages() {
	messageContainer.innerHTML = ""; // 컨텐츠 박스 초기화
	for (let i = 0; i < log.length; i++) {
		messageContainer.appendChild(createMessage(log[i].role, log[i].content));
	}
	console.table(log);
}

renderMessages();

// 임베딩 쿼리 기능
async function embeddingQuery(queryText) {
	let requestPayload = { action: "createEmbedding", target: queryText };
	const response = await fetch("/request", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(requestPayload),
	});
	const serverData = await response.json(); // 임베딩 데이터 수신
	console.log("임베딩 결과"); // 로그에 입력
	console.table(serverData); // 로그에 입력
}

submit.addEventListener("click", function () {
	let value = message.value;
	console.log("쿼리 데이터: ", value);
	embeddingQuery(value);
	value = "";
});
