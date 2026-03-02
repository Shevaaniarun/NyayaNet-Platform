import faiss
import pickle
import numpy as np
from sentence_transformers import SentenceTransformer

print("⏳ Loading model and index...")
index = faiss.read_index("legal_index.faiss")

with open("legal_docs.pkl", "rb") as f:
    all_docs = pickle.load(f)

embedder = SentenceTransformer("all-MiniLM-L6-v2")
print(f"✅ Ready — {index.ntotal} sections loaded")


def retrieve(query: str, top_k: int = 5):
    query_vec = embedder.encode([query], convert_to_numpy=True)
    faiss.normalize_L2(query_vec)
    scores, indices = index.search(query_vec, top_k)

    results = []
    for score, idx in zip(scores[0], indices[0]):
        if idx == -1:
            continue
        doc = all_docs[idx].copy()
        doc["score"] = float(score)
        results.append(doc)
    return results