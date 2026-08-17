import os
import requests

from chromadb import PersistentClient
from langchain_ollama import OllamaEmbeddings

from dotenv import load_dotenv

load_dotenv()

print("-------------- Chroma Knowledge Builder --------------")


# =====================================================
# 1. Embedding Model
# =====================================================

OLLAMA_HOST = os.environ.get("OLLAMA_HOST", "http://localhost:11434")

emb_model = OllamaEmbeddings(
    model="nomic-embed-text",
    base_url=OLLAMA_HOST
)


# =====================================================
# 2. Spring Product Service
# =====================================================

SPRING_BASE_URL = os.environ.get("SPRING_BASE_URL", "http://localhost:8080")

SPRING_API_URL = f"{SPRING_BASE_URL}/internal/allProducts"


# =====================================================
# 3. ChromaDB
# =====================================================

CHROMA_DB_DIR = "./chroma-db"

DB_COL_NAME = "indiamart_products"


chroma_client = PersistentClient(
    path=CHROMA_DB_DIR
)

chroma_db_col = (
    chroma_client.get_or_create_collection(
        name=DB_COL_NAME
    )
)

print(
    "Chroma DB Collection:",
    DB_COL_NAME
)


# =====================================================
# 4. Create Product Content
# =====================================================

def create_product_content(product):

    return f"""
Product Name: {product.get("name", "")}

Description: {product.get("description", "")}

Brand: {product.get("brand", "")}

Category: {product.get("category", "")}
"""


# =====================================================
# 5. Sync ONE Product
# =====================================================

def sync_product(product_id):

    print(
        f"Syncing product: {product_id}"
    )

    # ---------------------------------------------
    # Get product from Spring
    # ---------------------------------------------

    response = requests.get(
        f"{SPRING_BASE_URL}/api/products/{product_id}",
        timeout=10
    )

    if response.status_code != 200:

        raise Exception(
            f"Failed to fetch product "
            f"{product_id}. "
            f"Status: {response.status_code}"
        )

    product = response.json()


    # ---------------------------------------------
    # Product ID
    # ---------------------------------------------

    product_id = str(
        product["productId"]
    )


    # ---------------------------------------------
    # Create RAG content
    # ---------------------------------------------

    content = create_product_content(
        product
    )


    # ---------------------------------------------
    # Create embedding
    # ---------------------------------------------

    embedding = emb_model.embed_documents(
        [content]
    )[0]


    # ---------------------------------------------
    # Metadata
    # ---------------------------------------------

    metadata = {

        "productId": product_id,

        "name": product.get(
            "name",
            ""
        ),

        "brand": product.get(
            "brand",
            ""
        ),

        "category": product.get(
            "category",
            ""
        ),
        "description": product.get(
            "description",
            ""
        )
    }


    # ---------------------------------------------
    # Save / Update ChromaDB
    # ---------------------------------------------

    chroma_db_col.upsert(

        ids=[product_id],

        embeddings=[embedding],

        metadatas=[metadata],

        documents=[content]
    )


    print(
        f"Product {product_id} "
        f"successfully synced to ChromaDB"
    )


# =====================================================
# 6. Delete ONE Product
# =====================================================

def delete_product(product_id):

    product_id = str(product_id)

    print(
        f"Deleting product: {product_id}"
    )

    chroma_db_col.delete(
        ids=[product_id]
    )

    print(
        f"Product {product_id} "
        f"deleted from ChromaDB"
    )


# =====================================================
# 7. Initial Sync - ALL Products
# =====================================================

def sync_all_products():

    print(
        "Starting initial product sync..."
    )


    # ---------------------------------------------
    # Get ALL products
    # ---------------------------------------------

    response = requests.get(
        SPRING_API_URL,
        timeout=30
    )


    if response.status_code != 200:

        raise Exception(
            "Failed to fetch products "
            "from Spring API"
        )


    products = response.json()


    print(
        "Products received from Spring:",
        len(products)
    )


    # ---------------------------------------------
    # Prepare ChromaDB data
    # ---------------------------------------------

    contents = []

    metadatas = []

    ids = []


    for product in products:

        product_id = str(
            product["productId"]
        )


        content = create_product_content(
            product
        )


        contents.append(
            content
        )


        ids.append(
            product_id
        )


        metadatas.append({

            "productId": product_id,

            "name": product.get(
                "name",
                ""
            ),

            "brand": product.get(
                "brand",
                ""
            ),

            "category": product.get(
                "category",
                ""
            ),
            "description": product.get(
                        "description",
                        ""
            )
        })


    # ---------------------------------------------
    # Create embeddings
    # ---------------------------------------------

    embeddings = (
        emb_model.embed_documents(
            contents
        )
    )


    print(
        "Data ready for ChromaDB:",
        len(contents)
    )


    # ---------------------------------------------
    # Save to ChromaDB
    # ---------------------------------------------

    chroma_db_col.upsert(

        ids=ids,

        embeddings=embeddings,

        metadatas=metadatas,

        documents=contents
    )


    print(
        "Initial sync completed:",
        len(products),
        "products"
    )


    return {
        "products_synced": len(products)
    }


if __name__ == "__main__":
    sync_all_products()