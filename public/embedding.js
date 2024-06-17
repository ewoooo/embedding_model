import OpenAI from "openai";
import dotenv from "dotenv";

//키 호출
dotenv.config();
const openai = new OpenAI(process.env.OPENAI_API_KEY);

// OpenAI Embedding Fuction
async function getEmbedding(myInput) {
	const targetMessage = myInput[0].content;
	console.log("임베딩 타겟 메세지: ", targetMessage);

	const embedding = await openai.embeddings.create({
		model: "text-embedding-3-small",
		input: targetMessage,
		encoding_format: "float",
	});

	console.log("임베딩이 완료되었습니다:", embedding.usage);
	console.log("임베딩 리턴:", embedding.data[0].embedding);
}

let myInput = [{ role: "system", content: "고양이" }];
getEmbedding(myInput);
