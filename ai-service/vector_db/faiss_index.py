import faiss
import numpy as np
import os

# Always resolve the embeddings folder relative to this file
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
EMBEDDING_FOLDER = os.path.join(BASE_DIR, "embeddings")

dimension = 512
index = faiss.IndexFlatL2(dimension)

labels = []


def load_embeddings():

    global index, labels

    # reset index to avoid duplicate loading
    index.reset()
    labels.clear()

    print("Embedding folder:", EMBEDDING_FOLDER)

    if not os.path.exists(EMBEDDING_FOLDER):
        print("Embedding folder not found")
        return

    for file in os.listdir(EMBEDDING_FOLDER):

        print("Found file:", file)

        if file.endswith(".npy"):

            path = os.path.join(EMBEDDING_FOLDER, file)

            embedding = np.load(path)

            index.add(np.array([embedding]).astype("float32"))

            # label = filename without .npy
            labels.append(os.path.splitext(file)[0])

    print("Embeddings loaded:", len(labels))


def search_face(query_embedding):

    if index.ntotal == 0:
        print("FAISS index empty")
        return None, None

    query_embedding = np.array([query_embedding]).astype("float32")

    distances, indices = index.search(query_embedding, 1)

    idx = indices[0][0]

    if idx < 0 or idx >= len(labels):
        return None, None

    match_label = labels[idx]
    match_distance = distances[0][0]

    return match_label, match_distance


if __name__ == "__main__":

    load_embeddings()

    print("FAISS index ready")