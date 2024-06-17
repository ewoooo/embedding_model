const submit = document.querySelector("#req-button");
const title = document.querySelector("#req-title");
const prompt = document.querySelector("#req-prompt");
const eventlist = document.querySelector("#req-selection");
const container = document.querySelector(".content-wrapper");

// 임베딩 비교 요청하기
async function requestComparison(title, eventlist) {
	let requestPayload = { title: title, event: eventlist };
	console.log(requestPayload);
	try {
		const response = await fetch("/compare", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(requestPayload),
		});
		const serverData = await response.json(); // 임베딩 데이터 수신
		console.log("임베딩 결과"); // 로그에 입력
		console.table(serverData);
		return serverData;
	} catch (error) {
		console.error("서버 요청 실패");
	}
}

// 임베딩 비교 테이블 제작
async function createComparisonTable(array) {
	container.innerHTML = "";
	// 유사도 전처리
	const mappedArray = array.map((item) => ({
		...item,
		similarity: parseFloat((item.similarity * 100).toFixed(2)),
	}));

	// 내림차순으로 정렬
	mappedArray.sort((a, b) => b.similarity - a.similarity);

	// // 내부 요소 생성
	// mappedArray.forEach((item, index) => {
	// 	let row = documentz;
	// });
}

// 임베딩 비교 요청 이벤트
submit.addEventListener("click", async function () {
	const targetTitle = title.value;
	const targetEvent = eventlist.value;
	const comparisonMatrix = await requestComparison(targetTitle, targetEvent);
	createComparisonTable(comparisonMatrix);

	// 초기화
	title.value = "";
});
