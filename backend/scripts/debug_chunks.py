from db.chroma import get_chroma_vector_store


def inspect_page_chunks(course_id: str, page: int) -> None:
    vector_store = get_chroma_vector_store()

    result = vector_store.get(
        where={
            "$and": [
                {"course_id": course_id},
                {"page": page}
            ]
        },
        include=["metadatas", "documents"]
    )

    ids = result.get("ids", [])
    metadatas = result.get("metadatas", [])
    documents = result.get("documents", [])

    print(f"Found {len(ids)} chunk(s) for page {page}\n")

    for i, (chunk_id, meta, doc) in enumerate(zip(ids, metadatas, documents)):
        print(f"--- Chunk {i + 1} | id={chunk_id} | chars={len(doc)} ---")
        print(f"metadata: {meta}")
        print(doc)
        print()


if __name__ == "__main__":
    inspect_page_chunks(course_id="6a33157542ad8d458bd46af0", page=27)