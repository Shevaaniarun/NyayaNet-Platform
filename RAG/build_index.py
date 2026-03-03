import faiss
import pickle
import numpy as np
from sentence_transformers import SentenceTransformer
from db_config import get_connection

# -------------------------------------------------------
# STEP 1 — Load all law sections from PostgreSQL
# -------------------------------------------------------

def load_law_sections():
    conn = get_connection()
    cursor = conn.cursor()

    query = """
        SELECT 
            la.act_name,
            la.act_year,
            ls.section_number,
            ls.section_title,
            ls.section_text
        FROM law_sections ls
        JOIN law_acts la ON ls.act_id = la.id
    """

    cursor.execute(query)
    rows = cursor.fetchall()

    all_docs = []

    for act_name, act_year, section_number, section_title, section_text in rows:
        if not section_text:
            continue

        text = (
            f"{act_name} ({act_year})\n"
            f"Section {section_number}: {section_title}\n"
            f"{section_text}"
        )

        all_docs.append({
            "act": act_name,
            "section_num": section_number,
            "section_title": section_title,
            "section_desc": section_text,
            "text": text,
            "source": f"{act_name} — Section {section_number}: {section_title}"
        })

    cursor.close()
    conn.close()

    print(f"✅ Loaded {len(all_docs)} law sections from PostgreSQL")
    return all_docs


# -------------------------------------------------------
# STEP 2 — Build FAISS Index
# -------------------------------------------------------

def build_index():
    print("📚 Loading sections from DB...")
    all_docs = load_law_sections()

    print("🔎 Loading embedding model...")
    embedder = SentenceTransformer("all-MiniLM-L6-v2")

    texts = [doc["text"] for doc in all_docs]

    print(f"⚙️ Embedding {len(texts)} sections...")
    embeddings = embedder.encode(
        texts,
        batch_size=64,
        show_progress_bar=True,
        convert_to_numpy=True
    )

    faiss.normalize_L2(embeddings)

    embedding_dim = embeddings.shape[1]
    index = faiss.IndexFlatIP(embedding_dim)
    index.add(embeddings)

    # Save index
    faiss.write_index(index, "legal_index.faiss")

    # Save docs metadata
    with open("legal_docs.pkl", "wb") as f:
        pickle.dump(all_docs, f)

    print("✅ FAISS index built and saved")
    print(f"   Total sections: {len(all_docs)}")
    print(f"   Total vectors : {index.ntotal}")


if __name__ == "__main__":
    build_index()