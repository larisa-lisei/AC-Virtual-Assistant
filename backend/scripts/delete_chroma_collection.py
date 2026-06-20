from db.chroma import get_chroma_vector_store

def delete_old_collection() -> None:
    vector_store = get_chroma_vector_store()
    vector_store.delete_collection()

    print("Old Chroma collection deleted successfully.")


if __name__ == "__main__":
    delete_old_collection()
