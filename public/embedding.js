const submit = document.querySelector("#req-button");
const title = document.querySelector("#req-title");
const prompt = document.querySelector("#req-prompt");
const eventlist = document.querySelector("#req-selection");
const tableContainer = document.querySelector(".table-wrapper");

// 테이블 불러오기
async function requestTable() {
	const response = await fetch("/table", {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
		},
	});
	const tableData = await response.json();
	console.log("데이터 베이스 불러오기 완료");
	console.table(tableData);
	createTable(tableData);
}

// 테이블 만들기
function createTable(array) {
	tableContainer.innerHTML = ""; // 기존 내용 초기화

	array.forEach((table, i) => {
		let row = document.createElement("ul");
		// let indexRow = document.createElement("li");
		let titleRow = document.createElement("li");
		let eventRow = document.createElement("li");
		let promptRow = document.createElement("li");

		eventRow.textContent = table.event;
		// indexRow.textContent = i + 1;
		titleRow.textContent = table.title;
		promptRow.textContent = table.prompt;

		row.append(eventRow, titleRow, promptRow);
		tableContainer.append(row);
	});
}

// 테이블 불러오기 이벤트
window.addEventListener("DOMContentLoaded", function () {
	requestTable();
});

// 임베딩 만들기
async function embeddingQuery(title, prompt, event) {
	let requestPayload = { title: title, prompt: prompt, event: event };
	if (title && prompt && event) {
		try {
			const response = await fetch("/request", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(requestPayload),
			});
			// 정말 많은 일이 있엇어.. 힘들다 진짜
			const serverData = await response.json(); // 임베딩 데이터 수신
			console.log("임베딩 결과"); // 로그에 입력
			console.table(serverData); // 로그에 입력
			return serverData;
		} catch (error) {
			console.error("서버 요청 실패");
		}
	} else {
		alert("모두 작성하세요");
	}
}

// 임베딩 만들기 이벤트
submit.addEventListener("click", async function () {
	const targetTitle = title.value;
	const targetPrompt = prompt.value;
	const targetEvent = eventlist.value;
	console.log("다음 요소를 서버로 전달해 임베딩을 요청합니다: ", targetTitle, targetPrompt, targetEvent);
	const embeddingData = await embeddingQuery(targetTitle, targetPrompt, targetEvent);
	createTable(embeddingData);

	// 입력 필드 초기화
	targetTitle.value = "";
	targetPrompt.value = "";
});
