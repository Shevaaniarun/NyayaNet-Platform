import json
import pickle
import faiss
import numpy as np
from pathlib import Path
from sentence_transformers import SentenceTransformer

# -------------------------------------------------------
# Step 1: Load your existing saved docs and index
# -------------------------------------------------------
print("Loading existing index and docs...")
index = faiss.read_index("legal_index.faiss")
with open("legal_docs.pkl", "rb") as f:
    existing_docs = pickle.load(f)

print(f"✅ Existing docs: {len(existing_docs)}")
print(f"✅ Existing index vectors: {index.ntotal}")

# -------------------------------------------------------
# Step 2: Load new JSON acts (CPA, CDRC, etc.)
# Put all your new JSON files in a folder called /new_acts
# -------------------------------------------------------
def load_rich_json(filepath: str) -> list[dict]:
    """
    Loads a JSON file in the rich schema format (CPA2019 style).
    Uses embedding_text if available, otherwise builds from section fields.
    """
    with open(filepath, "r", encoding="utf-8") as f:
        data = json.load(f)

    # JSON may be a list of sections directly, or wrapped in a dict
    if isinstance(data, list):
        sections = data
    elif isinstance(data, dict):
        sections = next(
            (v for v in data.values() if isinstance(v, list)), []
        )
    else:
        sections = []

    docs = []
    for section in sections:
        act_name    = section.get("act_name", "Unknown Act")
        section_num = section.get("section_number", "")
        section_title = section.get("section_title", "")
        section_text  = section.get("section_text", "").strip()
        chapter_num   = section.get("chapter_number", "")
        chapter_name  = section.get("chapter_name", "")
        embedding_text = section.get("embedding_text", "").strip()
        keywords      = section.get("related_keywords", [])

        if not section_text:
            continue

        # Use the pre-built embedding_text if available (it's more concise)
        # Otherwise build our own
        if embedding_text:
            text_to_embed = (
                f"{act_name}\n"
                f"Chapter {chapter_num}: {chapter_name}\n"
                f"Section {section_num}: {section_title}\n"
                f"{embedding_text}\n"
                f"Keywords: {', '.join(keywords)}"
            )
        else:
            text_to_embed = (
                f"{act_name}\n"
                f"Chapter {chapter_num}: {chapter_name}\n"
                f"Section {section_num}: {section_title}\n"
                f"{section_text[:1000]}"  # cap at 1000 chars for embedding
            )

        docs.append({
            "act":           act_name,
            "chapter":       chapter_num,
            "chapter_title": chapter_name,
            "section_num":   section_num,
            "section_title": section_title,
            "section_desc":  section_text,
            "text":          text_to_embed,
            "source":        f"{act_name} — Section {section_num}: {section_title}",
            # extra fields from rich schema
            "law_id":        section.get("law_id", ""),
            "category":      section.get("category", ""),
            "keywords":      keywords,
            "sub_sections":  section.get("sub_sections", []),
            "importance":    section.get("importance_level", ""),
        })

    return docs


# Load all new JSON files from the new_acts folder
NEW_ACTS_DIR = Path("new_acts")
new_docs = []

for json_file in NEW_ACTS_DIR.glob("*.json"):
    docs = load_rich_json(str(json_file))
    new_docs.extend(docs)
    print(f"✅ {json_file.name}: {len(docs)} sections loaded")

print(f"\n📚 New sections to add: {len(new_docs)}")

# -------------------------------------------------------
# Step 3: Embed only the NEW docs
# -------------------------------------------------------
print("\nEmbedding new docs...")
embedder = SentenceTransformer("all-MiniLM-L6-v2")

new_texts = [doc["text"] for doc in new_docs]
new_embeddings = embedder.encode(
    new_texts,
    batch_size=64,
    show_progress_bar=True,
    convert_to_numpy=True
)

faiss.normalize_L2(new_embeddings)
print(f"✅ New embeddings shape: {new_embeddings.shape}")

# -------------------------------------------------------
# Step 4: Add new vectors to existing FAISS index
# -------------------------------------------------------
index.add(new_embeddings)
print(f"✅ Index now has {index.ntotal} total vectors")

# -------------------------------------------------------
# Step 5: Merge docs and save everything
# -------------------------------------------------------
all_docs = existing_docs + new_docs

faiss.write_index(index, "legal_index.faiss")
with open("legal_docs.pkl", "wb") as f:
    pickle.dump(all_docs, f)

print(f"\n✅ Done! Saved updated index and docs.")
print(f"   Total sections: {len(all_docs)}")
print(f"   Total vectors : {index.ntotal}")