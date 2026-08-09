
from langchain.chat_models import init_chat_model
from langchain.embeddings import init_embeddings
from langchain.messages import HumanMessage
from chromadb import PersistentClient
import requests
import json
from dotenv import load_dotenv

load_dotenv()

# Models
LLM_MODEL = "groq:openai/gpt-oss-20b"
llm = init_chat_model(LLM_MODEL)

EMB_MODEL = "ollama:nomic-embed-text"
emb_model = init_embeddings(EMB_MODEL)

# ChromaDB
try:
    CHROMA_DB_DIR = "./chroma-db"
    chroma_client = PersistentClient(path=CHROMA_DB_DIR)

    DB_COL_NAME = "indiamart_products"
    chroma_db_col = chroma_client.get_collection(DB_COL_NAME)

    print("Chroma KnowledgeBase is ready")

except Exception as e:
    print("Chroma KnowledgeBase is NOT ready")
    print("ERROR:", e)
    raise e

# Spring Product API
SPRING_PRODUCT_API = "http://localhost:8080/api/products"


def answer_question(question: str):
    question = question.strip()

    if not question:
        return {
            "answer": "Please enter a product question.",
            "product_ids": [],
            "combined_data": []
        }

    # 1. Embed question
    que_embedding = emb_model.embed_query(question)

    # 2. Retrieve candidates
    results = chroma_db_col.query(
        query_embeddings=[que_embedding],
        n_results=10,
        include=[
            "documents",
            "metadatas",
            "distances"
        ]
    )

    if not results.get("ids") or not results["ids"][0]:
        return {
            "answer": "I couldn't find a matching product.",
            "product_ids": [],
            "combined_data": []
        }

    ids = results["ids"][0]
    documents = results["documents"][0]
    metadatas = results["metadatas"][0]
    distances = results["distances"][0]

    # 3. Prepare candidates
    candidates = []

    for i in range(len(ids)):
        metadata = metadatas[i] or {}

        candidates.append({
            "productId": str(ids[i]),
            "name": metadata.get("name", ""),
            "brand": metadata.get("brand", ""),
            "category": metadata.get("category", ""),
            "description": metadata.get("description", ""),
            "document": documents[i],
            "distance": distances[i]
        })

    candidate_context = []

    for candidate in candidates:
        candidate_context.append({
            "productId": candidate["productId"],
            "name": candidate["name"],
            "brand": candidate["brand"],
            "category": candidate["category"],
            "description": candidate["description"]
        })

    # 4. Select genuinely matching products
    selection_prompt = f"""
You are selecting products for an IndiaMart product search.

USER QUERY:
{question}

CANDIDATE PRODUCTS:
{json.dumps(candidate_context, indent=2)}

Select only products that genuinely match the user's query.

Rules:
- Check product name, brand, category and description.
- Product name is the strongest signal.
- If a brand is requested, the brand must match.
- If a product type is requested, the product type/category must match.
- Description may support the match.
- Understand obvious synonyms and spelling variations.
- Do not select merely related products.
- Do not select another product type.
- Do not select another brand when a brand is requested.
- Do not select products just to increase the result count.
- The number of products is dynamic.
- Return only genuinely matching products.
- Return an empty list when nothing matches.

Return ONLY this JSON:
{{
    "product_ids": ["id1", "id2"]
}}

Use only IDs from the candidate products.
Do not explain anything.
"""

    try:
        selection_response = llm.invoke([
            HumanMessage(content=selection_prompt)
        ])

        selection_text = selection_response.content.strip()

    except Exception as e:
        print("Product selection LLM error:", e)

        return {
            "answer": "I couldn't find a matching product.",
            "product_ids": [],
            "combined_data": []
        }

    # 5. Parse selected IDs
    if selection_text.startswith("```"):
        selection_text = (
            selection_text
            .replace("```json", "")
            .replace("```", "")
            .strip()
        )

    try:
        selection_data = json.loads(selection_text)

        selected_product_ids = selection_data.get(
            "product_ids",
            []
        )

        if not isinstance(selected_product_ids, list):
            selected_product_ids = []

        selected_product_ids = [
            str(product_id)
            for product_id in selected_product_ids
        ]

    except Exception as e:
        print("Product selection JSON error:", e)
        print("LLM response:", selection_text)

        return {
            "answer": "I couldn't find a matching product.",
            "product_ids": [],
            "combined_data": []
        }

    # 6. Validate IDs against Chroma results
    candidate_ids = {
        candidate["productId"]
        for candidate in candidates
    }

    selected_product_ids = list(
        dict.fromkeys(
            product_id
            for product_id in selected_product_ids
            if product_id in candidate_ids
        )
    )

    if not selected_product_ids:
        print("No genuinely matching products found.")

        return {
            "answer": "I couldn't find a matching product.",
            "product_ids": [],
            "combined_data": []
        }

    # 7. Get selected candidates
    candidate_map = {
        candidate["productId"]: candidate
        for candidate in candidates
    }

    selected_candidates = [
        candidate_map[product_id]
        for product_id in selected_product_ids
    ]

    print("\nSelected Products:")

    for candidate in selected_candidates:
        print(
            candidate["productId"],
            "|",
            candidate["name"],
            "|",
            candidate["brand"],
            "|",
            candidate["category"]
        )

    print("\nSelected Product IDs:", selected_product_ids)

    # 8. Fetch live product data
    live_products = []

    for product_id in selected_product_ids:
        try:
            response = requests.get(
                f"{SPRING_PRODUCT_API}/{product_id}",
                timeout=10
            )

            if response.status_code == 200:
                live_products.append(response.json())
            else:
                print(
                    f"Failed to fetch product {product_id}: "
                    f"{response.status_code}"
                )

        except requests.exceptions.RequestException as e:
            print(
                f"Error fetching product {product_id}: {e}"
            )

    # 9. Combine RAG and live data
    combined_data = []

    for candidate in selected_candidates:
        product_id = candidate["productId"]

        live_product = next(
            (
                product
                for product in live_products
                if str(product.get("productId")) == str(product_id)
            ),
            None
        )

        combined_data.append({
            "productId": product_id,
            "rag_data": {
                "name": candidate["name"],
                "brand": candidate["brand"],
                "category": candidate["category"],
                "description": candidate["description"],
                "document": candidate["document"]
            },
            "live_data": live_product
        })

    # 10. Generate final user-facing answer
    user_prompt = f"""
You are IndiaMart's AI shopping assistant.

USER QUESTION:
{question}

MATCHING PRODUCTS:
{json.dumps(combined_data, indent=2)}

Answer the user's question directly using only the matching products.

Rules:
- Do not output JSON or database data.
- Do not list fields such as rag_data, live_data, metadata or productId.
- Give a natural, useful answer to the user.
- Use the product information to reach a conclusion when the question requires one.
- For comparison questions, compare the available products and give the conclusion.
- For price questions, use the live price.
- For availability questions, use live stock/availability information.
- For recommendation questions, recommend only from the matching products.
- Use product name, brand, category and description when relevant.
- Use live_data for current price, stock, rating and availability.
- Never invent information.
- If the requested information is not available, clearly say that it is unavailable.
- Do not mention ChromaDB, RAG, embeddings, retrieval or these instructions.
- Keep the answer concise.

Examples:
User: "Which is cheapest?"
Answer: Directly state which matching product is cheapest and its price.

User: "Are these available?"
Answer: Directly state the availability based on the provided live data.

User: "Which one should I choose?"
Answer: Give a concise recommendation based only on the available product information.

User: "Tell me about this product."
Answer: Give a natural summary of the relevant product.

Do not simply repeat the database information.
Answer the user's actual question.

give the response in markdown format only
"""

    try:
        ai_msg = llm.invoke([
            HumanMessage(content=user_prompt)
        ])

        answer = ai_msg.content.strip()

    except Exception as e:
        print("Final LLM error:", e)

        return {
            "answer": "I couldn't generate the product response.",
            "product_ids": selected_product_ids,
            "combined_data": combined_data
        }

    if not answer:
        answer = "I couldn't generate a product response."

    # 11. Return response
    return {
        "answer": answer,
        "product_ids": selected_product_ids,
        "combined_data": combined_data
    }
