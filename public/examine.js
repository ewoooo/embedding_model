const submit = document.querySelector("#req-button");
const title = document.querySelector("#req-title");
const eventlist = document.querySelector("#req-selection");
const container = document.querySelector(".comparison-wrapper");
const targetContainer = document.querySelector(".comparison-target");
const comparisonContainer = document.querySelector(".comparison-table");

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
function createComparisonArray(array) {
	// 유사도를 읽기 쉽게 전처리
	const mappedArray = array.map((item) => ({
		...item,
		similarity: parseFloat((item.similarity * 100).toFixed(2)),
	}));

	// 내림차순으로 정렬
	mappedArray.sort((a, b) => b.similarity - a.similarity);

	// 가장 유사한 5개만 가져오기
	const sortedArray = mappedArray.slice(0, 5);
	return sortedArray;
}

// 애니메이션 기능
function addAnimation(target) {
	target.style.animation = `dropIn 1000ms cubic-bezier(0.33, 1, 0.68, 1) forwards`;
	target.style.opacity = 1;

	setTimeout(() => {
		target.style = "";
	}, 1000);
}

// 비교 테이블 마크업
function createComparisonTable(array) {
	comparisonContainer.innerHTML = ""; // 초기화

	array.forEach((item, index) => {
		const row = document.createElement("ul");
		const title = document.createElement("li");
		const similarity = document.createElement("li");

		row.style.opacity = 0;
		title.textContent = item.title;
		similarity.textContent = item.similarity + "%";

		comparisonContainer.appendChild(row);
		row.append(title, similarity);

		setTimeout(() => {
			addAnimation(row);
		}, index * 200);
	});
}

// 타겟 테이블 마크업
function createTargetTable(target, call) {
	targetContainer.innerHTML = ""; // 초기화

	const content = document.createElement("div");
	const title = document.createElement("h3");
	const event = document.createElement("p");

	content.style.opacity = 0;
	title.textContent = target;
	event.textContent = `${call}에서 실행됨`;

	targetContainer.appendChild(content);
	content.append(title, event);
	addAnimation(content);
}

// 임베딩 비교 번들링
async function makeComparison() {
	const targetTitle = title.value; // 비교 요청할 타이틀
	const targetEvent = eventlist.value; // 비교 요청할 이벤트
	try {
		const comparisonMatrix = await requestComparison(targetTitle, targetEvent); //비교 요청하기
		const comparisonArray = createComparisonArray(comparisonMatrix); // 비교 정렬하기
		createComparisonTable(comparisonArray); // 비교 테이블 마크업
		createTargetTable(targetTitle, targetEvent); // 비교 대상 테이블 마크업
	} catch (error) {
		console.error("테이블 생성 실패", error);
	}
}

// 임베딩 비교 요청 이벤트
submit.addEventListener("click", function () {
	makeComparison();

	// 초기화
	title.value = "";
});

// 임베딩 비교 요청 이벤트 (키 프레스)
title.addEventListener("keypress", function (e) {
	if (e.key === "Enter") {
		makeComparison();

		// 초기화
		title.value = "";
	}
});
